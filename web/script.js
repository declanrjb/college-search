function loadSection(unitid, section) {
    if (section == 'cds') {
        loadCds(unitid)
    } else {
        var dataHolderId = '#' + section + ' .data-holder'

        $(dataHolderId).empty()
        var query = 'https://college-search.onrender.com/' + section + '?unitid=' + unitid;
    
        console.log('sending ' + section)
    
        $.get(query, 
            function(data) {
                $(dataHolderId).html(data['data']);
            }
        )
    }
}

function loadCds(unitid) {

    $('#cds-list').empty()

    var query = 'https://college-search.onrender.com/cds?unitid=' + unitid;

    console.log('sending cds...')

    $.get(query, 
        function(data) {
            console.log(data['data'])
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

function loadData(unitid) {
    // loadSection(unitid, 'propublica')
    // loadSection(unitid, 'officers')
    // loadSection(unitid, 'admissions')
    loadCds(unitid)
}

$(function() {

    var unitid;

    /* set open and close states initially */
    $('.subsection[open="false"] .data-holder').css('display', 'none')
    $('.subsection[open="false"] #subsec-arrow').attr('class', 'fa-solid fa-caret-right')

    $('.subsection[open="true"] .data-holder').css('display', 'block')
    $('.subsection[open="true"] #subsec-arrow').attr('class', 'fa-solid fa-caret-down')

    /* set up open and close click function */
    $('.subsection-header').on('click', function(e) {
        if (e.currentTarget.parentElement.getAttribute('open') == 'false') {
            $(e.currentTarget.parentElement).children('.data-holder').css('display', 'block')
            e.currentTarget.parentElement.setAttribute('open', 'true')
            $(e.currentTarget).children('.subsection-title').children('#subsec-arrow').attr('class', 'fa-solid fa-caret-down')

            loadSection(unitid, e.currentTarget.parentElement.getAttribute('id'))
        } else {
            $(e.currentTarget.parentElement).children('.data-holder').css('display', 'none')
            e.currentTarget.parentElement.setAttribute('open', 'false')
            $(e.currentTarget).children('.subsection-title').children('#subsec-arrow').attr('class', 'fa-solid fa-caret-right')
        }
    })

    $('.search-button').on('click', function() {

        /* clear the previous completions */
        $('.completions-holder').empty();

        var query = 'https://college-search.onrender.com/search?q=' + $('.college-search-input').val();

        console.log('sending...')

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
                    //loadData(unitid);
                })
            }
        )

    })
})