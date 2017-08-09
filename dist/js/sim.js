window.Sim = (function($, _) {

    var rankLimit = 3;

    var host = "https://www.ehanlin.com.tw";

    /**
     * 取得模擬考資訊
     */
    function getSimMetadata(year, onSuccess) {
        $.when($.get(host + "/sim_"+ year + "/SimMataData")).done(onSuccess);
    }

    /**
     * 取得英雄資訊
     */
    function getHero(query, onSuccess) {
        $.when($.get(host + "/sim_" + query.year + "/hero", query)).done(onSuccess);
    }

    /**
     * 取得模擬考資訊
     */
    function getTermtest(year, type, onSuccess) {
        getSimMetadata(year, function(resp) {
            var schedule = _.filter(resp.result, function(it) { return it.year == year && it.type == type });
            if (_.isFunction(onSuccess)) {
                onSuccess(schedule);
            } else {
                return schedule;
            }
        })
    }

    /**
     * 取得最新的模擬考英雄榜
     */
    function getHeroBoard(year, onSuccess) {
        getHero({year: year}, function(resp) {
            var data = _.filter(resp.result, function(it) { return it.rank <= rankLimit });
            if (_.isFunction(onSuccess)) {
                onSuccess(data)
            } else {
                return data;
            }
        });
    }

    /**
     * 取得模擬考榜單
     */
    function getBoard(year, volume, number) {
        getHero({year: year, volume: volume, number: number}, function(resp) {
            console.log(resp);
            var exams = _.chain(resp)
                .filter(function(it) { return it.rank <= rankLimit })
                .groupBy(function(it) { return [it.year, it.volume, it.number, it.examType, it.examName].join("|") })
                .value();

            var list = _.map(exams, function(heroes, key) {
                var _data = key.split("|");
                var examType = _data[3];
                var examName = _data[4];
                return { examType: examType, examName: examName, heroes: heroes }
            });

            $.blockUI({
                message: $('#sim-board-template').tmpl(list),
                css: {
                    top:  ($(window).height() - 490) /2 + 'px',
                    left: ($(window).width() - 790) /2 + 'px',
                    border: '1px solid rgb(95, 95, 95)',
                    borderRadius: "10%",
                    padding: '0px',
                    boxShadow: 'rgb(135, 135, 135) 0px 0px 8px 2px',
                    width: '790',
                    height: '490',
                    cursor: 'default'
                },
                overlayCSS: {
                    backgroundColor: '#000',
                    opacity: '0.4'
                },
                onOverlayClick: $.unblockUI
            });
        });
    }

    return {
        getBoard: getBoard,
        getHeroBoard: getHeroBoard,
        getTermtest: getTermtest
    }

})(jQuery, _);
