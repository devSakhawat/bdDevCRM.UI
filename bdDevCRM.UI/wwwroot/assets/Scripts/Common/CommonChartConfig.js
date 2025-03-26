var commonChartConfigHelper = {
    
    ThreeDDonutChart: function (ctlId, data, text, legend) {
      
        var chart = AmCharts.makeChart(ctlId, {
            "type": "pie",
            "theme": "none",
            "titles": [{
                "text": text,
                "size": 16
            }],
            "legend": legend,
            "dataProvider": data,
            "valueField": "data",
            "titleField": "label",
            "colorField": "color",
            "startEffect": "elastic",
            "startDuration": 2,
            "labelRadius": 15,
            "innerRadius": "50%",
            "depth3D": 10,
          
            "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
            "angle": 15,
            //"exportConfig": {
            //    menuItems: [{
            //        icon: '/lib/3/images/export.png',
            //        format: 'png'
            //    }]
            //}
        });
        jQuery('.chart-input').off().on('input change', function () {
            var property = jQuery(this).data('property');
            var target = chart;
            var value = Number(this.value);
            chart.startDuration = 0;

            if (property == 'innerRadius') {
                value += "%";
            }

            target[property] = value;
            chart.validateNow();
        });
    },
    
    ThreeDColumnChart: function (ctlId,data,title) {
        var chart = AmCharts.makeChart(ctlId, {
            "theme": "none",
            "type": "serial",
            "startDuration": 2,
            "dataProvider": data,
            
            "valueAxes": [{
                "position": "left",
                "title": title
            }],
            "graphs": [{
                "balloonText": "[[category]]",
                "colorField": "color",
                "fillAlphas": 1,
                "lineAlpha": 0.1,
                "type": "column",
                "valueField": "data"
            }],
            "depth3D": 20,
            "angle": 30,
            "chartCursor": {
                "categoryBalloonEnabled": false,
                "cursorAlpha": 0,
                "zoomable": false
            },
            "categoryField": "dataWithLabel",
            "categoryAxis": {
                "gridPosition": "start",
                "labelRotation": 0
            },
            "exportConfig": {
                "menuTop": "20px",
                "menuRight": "20px",
                "menuItems": [{
                    "icon": '/lib/3/images/export.png',
                    "format": 'png'
                }]
            }
        });
        jQuery('.chart-input').off().on('input change', function() {
            var property = jQuery(this).data('property');
            var target = chart;
            chart.startDuration = 0;

            if (property == 'topRadius') {
                target = chart.graphs[0];
                if (this.value == 0) {
                    this.value = undefined;
                }
            }

            target[property] = this.value;
            chart.validateNow();
        });

    },
    
    LogarithmicScale: function (ctlId, data) {
    
        var chart = AmCharts.makeChart(ctlId, {
            "type": "serial",
            "theme": "none",
            //"pathToImages": "http://www.amcharts.com/lib/3/images/",
            "dataProvider": data,
            "valueAxes": [{
                "logarithmic": true,
                "dashLength": 1,
                "guides": [{
                    "dashLength": 6,
                    "inside": true,
                    "label": "average",
                    "lineAlpha": 1,
                    "value": 90.4
                }],
                "position": "left"
            }],
            "graphs": [{
                "bullet": "round",
                "id": "g1",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 7,
                "lineThickness": 2,
                "title": "Price",
                "type": "smoothedLine",
                "useLineColorForBulletBorder": true,
                "valueField": "data"
            }],
            "chartScrollbar": {},
            "chartCursor": {
                "cursorPosition": "mouse"
            },
            "dataDateFormat": "YYYY-MM-DD",
            "categoryField": "label",
            "categoryAxis": {
                "parseDates": true
            }
        });
    },
    
    ThreeDPieChart: function (ctlId, data, legend) {
  
        var chart = AmCharts.makeChart(ctlId, {
            "type": "pie",
            "theme": "none",
            "legend": legend ,
            "dataProvider": data,
            "valueField": "data",
            "titleField": "label",
            "outlineAlpha": 0.4,
            "depth3D": 15,
            "colorField": "color",
            "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
            "angle": 30,
            "exportConfig": {
                menuItems: [{
                    icon: '/lib/3/images/export.png',
                    format: 'png'
                }]
            }
        });
        
        jQuery('.chart-input').off().on('input change', function () {
            var property = jQuery(this).data('property');
            var target = chart;
            var value = Number(this.value);
            chart.startDuration = 0;
            //chart.colorField = "color";
            if (property == 'innerRadius') {
                value += "%";
            }
            
            target[property] = value;
            chart.validateNow();
        });
    },
   
};