var Q = require("q");
var fs = require("fs");
var del = require("del");
var gulp = require("gulp");
var less = require("less");
var es = require("event-stream");
var rename = require("gulp-rename");
var util = require("gulp-template-util");
const gcPub = require("gulp-gcloud-publish");

const bucketNameForTest = "tutor-test-events";
const bucketNameForProd = "tutor-events";
const projectId = "tutor-204108";
const projectIdTest = "tutor-test-238709";
const keyFileName = "tutor.json";
const keyFileNameTest = "tutor-test.json";
const projectName = "event/termtest/";

let uploadGCSProd = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/js/**", "dist/img/**", "dist/lib/**", "dist/css/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileName,
                base: projectName,
                projectId: projectId,
                public: true,
                metadata: {
                    cacheControl: "no-store"
                }
            })
        );
};

let uploadGCSTest = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/js/**", "dist/img/**", "dist/css/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileNameTest,
                base: projectName,
                projectId: projectIdTest,
                public: true,
                metadata: {
                    cacheControl: "no-store"
                }
            })
        );
};

function buildStyle() {
    return es.map(function(file, cb) {
        less.render(
            file.contents.toString(),
            {
                paths: [],
                filename: file.path,
                compress: false
            },
            function(error, result) {
                if (error != null) {
                    console.log(error);
                    throw error;
                }
                file.contents = new Buffer(result.css);
                cb(null, file);
            }
        );
    });
}

function libTask(dest) {
    return function() {
        var packageJson = JSON.parse(fs.readFileSync("package.json", "utf8").toString());
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        var webLibModules = [];
        for (var module in packageJson.dependencies) {
            webLibModules.push("node_modules/" + module + "/**/*");
        }
        return gulp.src(webLibModules, { base: "node_modules/" }).pipe(gulp.dest(dest));
    };
}

function styleTask(dest) {
    return function() {
        return gulp
            .src("src/less/**/*.less")
            .pipe(buildStyle())
            .pipe(rename({ extname: ".css" }))
            .pipe(gulp.dest(dest));
    };
}

function copyStaticTask(dest) {
    return function() {
        return gulp.src(["src/**/*.html", "src/img/**", "src/js/**"], { base: "src" }).pipe(gulp.dest(dest));
    };
}

function cleanTask() {
    return del(["src/css"]);
}

gulp.task("clean", cleanTask);
gulp.task("lib", libTask("src/lib"));
gulp.task("style", styleTask("src/css"));
gulp.task("build", ["style", "lib"]);
gulp.task("watch", function() {
    gulp.watch("src/less/**/*.less", ["style"]);
});

gulp.task("package", function() {
    var deferred = Q.defer();
    Q.fcall(function() {
        return util.logPromise(cleanTask);
    }).then(function() {
        return Q.all([util.logStream(libTask("dist/lib")), util.logStream(copyStaticTask("dist")), util.logStream(styleTask("dist/css"))]);
    });

    return deferred.promise;
});

gulp.task("uploadGcsTest", uploadGCSTest.bind(uploadGCSTest, bucketNameForTest));
gulp.task("uploadGcsProd", uploadGCSProd.bind(uploadGCSProd, bucketNameForProd));
