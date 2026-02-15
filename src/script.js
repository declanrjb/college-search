import Chart from 'chart.js/auto'

var request_stem = 'http://127.0.0.1:5000'
// var request_stem = 'https://college-search.onrender.com'
var chart_types = {
    'propublica': 'bar',
    'admissions': 'line',
    'discipline': 'bar'
}

function loadSection(unitid, section) {

    console.log(section)

    $('#' + section).children('.chart-wrapper').children('.chart').each(function() {
        var curr_chart = Chart.getChart(this)
        if (curr_chart) {
            curr_chart.destroy()
        }
    })

    if (section == 'cds') {
        loadCds(unitid)
    } else if (section == 'news') {
        loadNews(unitid)
    } else if (section == 'enrollment') {
        loadEnrollment(unitid)
    } else if (section == 'demographics') {
        loadDemographics(unitid)
    } else if (section == 'crime') {
        loadCrime(unitid)
    } else if (section == 'hate') {
        loadHate(unitid)
    } else {
        var dataHolderId = '#' + section + ' .data-holder'

        $(dataHolderId).empty()
        var query = request_stem + '/' + section + '?unitid=' + unitid;
    
        $.get(query, 
            function(data) {

                console.log(data)

                $(dataHolderId).html(data['data']);
                // make charts
                var chart_data = data['charts']['data']

                var labels = data['charts']['headers']

                new Chart(
                    $('#' + section + ' .chart-left'),
                    {
                        type: chart_types[section],
                        data: {
                        labels: chart_data.map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[0],
                                data: chart_data.map(row => row.Field0),
                                backgroundColor: chart_data.map(row => row.Color0),
                                borderColor: chart_data.map(row => row.Color0)
                            }
                        ]
                        }
                    }
                    )

                new Chart(
                    $('#' + section + ' .chart-right'),
                    {
                        type: chart_types[section],
                        data: {
                        labels: chart_data.map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[1],
                                data: chart_data.map(row => row.Field1),
                                backgroundColor: chart_data.map(row => row.Color1),
                                borderColor: chart_data.map(row => row.Color1)
                            }
                        ]
                        }
                    }
                    )


            }
        )
    }
}

function loadCds(unitid) {
    $('#cds-list').empty()

    var query = request_stem + '/cds?unitid=' + unitid;

    $.get(query, 
        function(data) {
            $('#cds-homepage').text(data['data']['homepage']).attr('href', data['data']['homepage'])
            var candDocs = data['data']['documents']
            for (var i=0; i<candDocs.length; i++) {
                doc = candDocs[i]
                $('#cds-list').append(
                    `<li><a href="LINK">NAME</a></li>`
                    .replace('LINK', doc['link'])
                    .replace('NAME', doc['htmlTitle'])
                );
            }

        }
    )
}

function loadEnrollment(unitid) {
    var dataHolderId = '#enrollment' + ' .data-holder'

    $(dataHolderId).empty()
    var query = request_stem + '/enrollment' + '?unitid=' + unitid;

    $.get(query, 
        function(data) {

            $(dataHolderId).append('<div class="enroll-table"></div>')
            $(dataHolderId).append('<div class="demo-table"></div>')

            $(dataHolderId).html(data['data'])

            var chart_data = data['charts'][0]
            var labels = chart_data['headers']

            new Chart(
                $('#enrollment' + ' .chart-left'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[0],
                                data: chart_data['data'].map(row => row.Field0),
                                backgroundColor: chart_data['data'].map(row => '#6184d8'),
                                borderColor: chart_data['data'].map(row => '#6184d8')
                            },
                            {
                                label: labels[1],
                                data: chart_data['data'].map(row => row.Field1),
                                backgroundColor: chart_data['data'].map(row => '#ff6663'),
                                borderColor: chart_data['data'].map(row => '#ff6663')
                            },
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true
                            }
                        }
                    }
                }
                )

            var chart_data = data['charts'][1]
            var labels = chart_data['headers']

            new Chart(
                $('#enrollment' + ' .chart-right'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[0],
                                data: chart_data['data'].map(row => row.Field0),
                                backgroundColor: chart_data['data'].map(row => '#6184d8')
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'x'
                    }
                }
                )


        }
    )
}

function loadHate(unitid) {
    var dataHolderId = '#hate' + ' .data-holder'

    $(dataHolderId).empty()
    var query = request_stem + '/hate' + '?unitid=' + unitid;

    $.get(query, 
        function(data) {

            $(dataHolderId).append('<div class="enroll-table"></div>')
            $(dataHolderId).append('<div class="demo-table"></div>')

            $(dataHolderId).html(data['data'])

            var chart_data = data['charts'][0]
            var labels = chart_data['headers']
            var colors = ['#6184d8', '#ff6663', 'fce694', '0beabd', 'e3b505', '2f4858']

            new Chart(
                $('#hate' + ' .chart-left'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: Array.from(Array(labels.length).keys()).map(
                            index => (
                                {
                                    label: labels[index],
                                    data: chart_data['data'].map(row => row['Field' + index]),
                                    backgroundColor: chart_data['data'].map(row => colors[index]),
                                    borderColor: chart_data['data'].map(row => colors[index])
                                }
                            )
                        )
                    },
                    options: {
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true
                            }
                        }
                    }
                }
                )

            var chart_data = data['charts'][1]
            var labels = chart_data['headers']

            new Chart(
                $('#hate' + ' .chart-right'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: Array.from(Array(labels.length).keys()).map(
                            index => (
                                {
                                    label: labels[index],
                                    data: chart_data['data'].map(row => row['Field' + index]),
                                    backgroundColor: chart_data['data'].map(row => colors[index]),
                                    borderColor: chart_data['data'].map(row => colors[index])
                                }
                            )
                        )
                    },
                    options: {
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true
                            }
                        }
                    }
                }
                )


        }
    )
}

function loadCrime(unitid) {
    var dataHolderId = '#crime' + ' .data-holder'

    $(dataHolderId).empty()
    var query = request_stem + '/crime' + '?unitid=' + unitid;

    $.get(query, 
        function(data) {

            $('#crime' + ' .data-holder').html(data['data'])

            var chart_data = data['charts'][0]
            var labels = chart_data['headers']

            new Chart(
                $('#crime' + ' .chart-left'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[0],
                                data: chart_data['data'].map(row => row.Field0),
                                backgroundColor: chart_data['data'].map(row => '#6184d8'),
                                borderColor: chart_data['data'].map(row => '#6184d8')
                            },
                            {
                                label: labels[1],
                                data: chart_data['data'].map(row => row.Field1),
                                backgroundColor: chart_data['data'].map(row => '#ff6663'),
                                borderColor: chart_data['data'].map(row => '#ff6663')
                            },
                            {
                                label: labels[2],
                                data: chart_data['data'].map(row => row.Field2),
                                backgroundColor: chart_data['data'].map(row => '#fce694'),
                                borderColor: chart_data['data'].map(row => '#fce694')
                            },
                            {
                                label: labels[3],
                                data: chart_data['data'].map(row => row.Field3),
                                backgroundColor: chart_data['data'].map(row => '#0beabd'),
                                borderColor: chart_data['data'].map(row => '#0beabd')
                            },
                            {
                                label: labels[4],
                                data: chart_data['data'].map(row => row.Field4),
                                backgroundColor: chart_data['data'].map(row => '#e3b505'),
                                borderColor: chart_data['data'].map(row => '#e3b505')
                            },
                            {
                                label: labels[5],
                                data: chart_data['data'].map(row => row.Field5),
                                backgroundColor: chart_data['data'].map(row => '#2f4858'),
                                borderColor: chart_data['data'].map(row => '#2f4858')
                            },
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true
                            }
                        }
                    }
                }
                )

            var chart_data = data['charts'][1]
            var labels = chart_data['headers']

            new Chart(
                $('#crime' + ' .chart-right'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[0],
                                data: chart_data['data'].map(row => row.Field0),
                                backgroundColor: chart_data['data'].map(row => '#6184d8'),
                                borderColor: chart_data['data'].map(row => '#6184d8')
                            },
                            {
                                label: labels[1],
                                data: chart_data['data'].map(row => row.Field1),
                                backgroundColor: chart_data['data'].map(row => '#ff6663'),
                                borderColor: chart_data['data'].map(row => '#ff6663')
                            },
                            {
                                label: labels[2],
                                data: chart_data['data'].map(row => row.Field2),
                                backgroundColor: chart_data['data'].map(row => '#fce694'),
                                borderColor: chart_data['data'].map(row => '#fce694')
                            },
                            {
                                label: labels[3],
                                data: chart_data['data'].map(row => row.Field3),
                                backgroundColor: chart_data['data'].map(row => '#0beabd'),
                                borderColor: chart_data['data'].map(row => '#0beabd')
                            },
                        ]
                    },
                    options: {
                        indexAxis: 'x',
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true
                            }
                        }
                    }
                }
                )


        }
    )
}

function loadDemographics(unitid) {
    var dataHolderId = '#demographics' + ' .data-holder'

    $(dataHolderId).empty()
    var query = request_stem + '/demographics' + '?unitid=' + unitid;
    $.get(query, 
        function(data) {

            console.log(data)

            var chart_data = data['gender']['charts']

            var labels = chart_data['headers']

            new Chart(
                $('#demographics' + ' .chart-right'),
                {
                    type: 'bar',
                    data: {
                        labels: chart_data['data'].map(row => row.x_axis),
                        datasets: [
                            {
                                label: labels[0],
                                data: chart_data['data'].map(row => row.Field0),
                                backgroundColor: chart_data['data'].map(row => '#6184d8'),
                                borderColor: chart_data['data'].map(row => '#6184d8')
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'x'
                    }
                }
                )

            var chart_data = data['ethnicity']['charts']
            var labels = chart_data['headers']
            new Chart(
                $('#demographics' + ' .chart-left'),
                    {
                        type: 'bar',
                        data: {
                            labels: chart_data['data'].map(row => row.x_axis),
                            datasets: [
                                {
                                    label: labels[0],
                                    data: chart_data['data'].map(row => row.Field0),
                                    backgroundColor: chart_data['data'].map(row => '#6184d8')
                                }
                            ],
                        },
                        options: {
                            indexAxis: 'y'
                        }
                    }
                )

            $(dataHolderId).append(
                '<div id="ethnicity-table"></div><div id="gender-table"></div>'
            )
            $('#gender-table').html(data['gender']['data'])
            $('#ethnicity-table').html(data['ethnicity']['data'])


        }
    )
}

function loadBlurb(unitid) {
    $('#blurb').empty()

    var query = request_stem + '/narrative?unitid=' + unitid;

    $.get(query, 
        function(data) {
            $('#blurb').html(data['data']).css('display', 'block')
        }
    )
}

function loadNews(unitid) {
    $('#news-list').empty()

    var query = request_stem + '/news?unitid=' + unitid;

    $.get(query, 
        function(data) {
            var articles = data['news_results']

            for (var i=0; i<9; i++) {
                article = articles[i]

                $('#news-list').append(
                    `
                    <a href="LINK"><div class="news-article">
                        <img class="thumbnail" src="IMG_SRC">
                        <h3 class="headline">HEADLINE</h3>
                        <p class="byline"><span class="reporter">REPORTER</span><i><span class="publication">OUTLET</span></i></p>
                        <hr>
                        <p class="date">PUBDATE</p>
                    </div></a>
                    `
                    .replace('IMG_SRC', article['thumbnail'])
                    .replace('HEADLINE', article['title'])
                    .replace('OUTLET', article['source']['name'])
                    .replace('PUBDATE', article['date'])
                    .replace('LINK', article['link'])
                    .replace('REPORTER', article['author'])
                );
            }

        }
    )
}

function generateCompletions() {
    /* clear the previous completions */
    $('.completions-holder').empty();

    var query = request_stem + '/search?q=' + $('.college-search-input').val();

    $.getJSON(query, 
        function(data) {
            var results = data['completions']

            for (var i=0; i<results.length; i++) {
                $('.completions-holder').append(
                    `
                    <div class="completion" unitid="UNITID">
                        NAME (STABBR)
                    </div>
                    `.replace('NAME', results[i]['INSTNM'])
                    .replace('STABBR', results[i]['STABBR'])
                    .replace('UNITID', results[i]['UNITID'])
                )
            }

            $('.completion').on('click', function(e) {
                var unitid = e.currentTarget.getAttribute('unitid');
                $('.college-search-input').val(e.currentTarget.textContent.trim());
                $('.college-search-input').attr('unitid', unitid)
                $('.completions-holder').empty();
                //loadNews(unitid)
                loadBlurb(unitid)
                $('.subsection').each(function(index) {
                    loadSection(unitid, $( this ).attr('id'))
                })
            })
        }
    )
}

$(function() {

    $('.college-search-input').attr('unitid', 204501)
    loadSection($('.college-search-input').attr('unitid'), 'crime')
    loadBlurb($('.college-search-input').attr('unitid'))

    /* set open and close states initially */
    $('.subsection[open="false"] .data-holder').css('display', 'none')
    $('.subsection[open="false"] .chart-wrapper').css('display', 'none')
    $('.subsection[open="false"] #subsec-arrow').attr('class', 'fa-solid fa-caret-right')

    $('.subsection[open="true"] .data-holder').css('display', 'block')
    $('.subsection[open="true"] .chart-wrapper').css('display', 'block')
    $('.subsection[open="true"] #subsec-arrow').attr('class', 'fa-solid fa-caret-down')

    /* set up open and close click function */
    $('.subsection-header').on('click', function(e) {
        if (e.currentTarget.parentElement.getAttribute('open') == 'false') {
            $(e.currentTarget.parentElement).children('.data-holder').css('display', 'block')
            $(e.currentTarget.parentElement).children('.chart-wrapper').css('display', 'block')

            e.currentTarget.parentElement.setAttribute('open', 'true')
            $(e.currentTarget).children('.subsection-title').children('#subsec-arrow').attr('class', 'fa-solid fa-caret-down')

            loadSection($('.college-search-input').attr('unitid'), e.currentTarget.parentElement.getAttribute('id'))
        } else {
            $(e.currentTarget.parentElement).children('.data-holder').css('display', 'none')
            $(e.currentTarget.parentElement).children('.chart-wrapper').css('display', 'none')
            e.currentTarget.parentElement.setAttribute('open', 'false')
            $(e.currentTarget).children('.subsection-title').children('#subsec-arrow').attr('class', 'fa-solid fa-caret-right')

            // clear current charts
            $(e.currentTarget.parentElement).children('.chart-wrapper').children('.chart').each(function() {
                var curr_chart = Chart.getChart(this)
                curr_chart.destroy()
            })
        }
    })

    $('.search-button').on('click', generateCompletions)

    $('.college-search-input').on('input', function(e) {
        var curr_val = $('.college-search-input').val();
        if (curr_val.length >= 3) {
            $('#blurb').css('display', 'none')
            generateCompletions()
        }
    })

    $('.college-search-input').on('click', function(e) {
        $(e.currentTarget).val('')
    })

    $('.download-button').on('click', function(e) {
        var table_html = $(e.currentTarget.parentElement).find('table').html()
        var request = request_stem + '/download?table=' + table_html
        console.log(request)

        //window.location.href = 'https://google.com';

        console.log('hello world')

        // var blob = new Blob([csv_data], {
        //     type: 'text/plain'
        // });

        // var link = document.createElement('a')
        // link.href = URL.createObjectURL(blob)
        // link.download = fileName
        // document.body.appendChild(link)
        // link.click()
        // document.body.removeChild(link)
    })
})