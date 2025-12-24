
function loadFinPosition(unitid) {
    var query = 'https://college-search.onrender.com/propublica?unitid=' + unitid;

    console.log('sending fin position...')

    $.get(query, 
        function(data) {
            $('#propublica .data-holder').html(data['data']);

        }
    )
}

function loadCds(unitid) {
    var query = 'https://college-search.onrender.com/cds?unitid=' + unitid;

    console.log('sending cds...')

    $.get(query, 
        function(data) {
            console.log(data['data'])
            $('#cds-homepage').text(data['data']['homepage']).attr('href', data['data']['homepage'])

        }
    )
}

function loadData(unitid) {
    loadFinPosition(unitid)
    loadCds(unitid)
}

$(function() {

    console.log($('.subsection-header'))

    $('.subsection-header').on('click', function(e) {
        if (e.currentTarget.getAttribute('open') == 'false') {
            $(e.currentTarget.parentElement).children('.data-holder').css('display', 'block')
            e.currentTarget.setAttribute('open', 'true')
            $(e.currentTarget).children('.subsection-title').children('#subsec-arrow').attr('class', 'fa-solid fa-caret-down')
        } else {
            $(e.currentTarget.parentElement).children('.data-holder').css('display', 'none')
            e.currentTarget.setAttribute('open', 'false')
            $(e.currentTarget).children('.subsection-title').children('#subsec-arrow').attr('class', 'fa-solid fa-caret-right')
        }
    })

    $('.search-button').on('click', function() {

        var query = 'https://college-search.onrender.com/search?q=' + $('.college-search-input').val();

        console.log('sending...')

        var unitid;

        $.getJSON(query, 
            function(data) {
                console.log(data)
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
                    unitid = e.currentTarget.getAttribute('unitid');
                    $('.college-search-input').val(e.currentTarget.textContent.trim());
                    $('.completions-holder').empty();
                    console.log(unitid)
                    loadData(unitid);
                })
            }
        )

    })
})