
function loadData(unitid) {
    var query = 'https://college-search.onrender.com/propublica?unitid=' + unitid;

    console.log('sending...')

    $.get(query, 
        function(data) {
            $('#propublica .data-holder').html(data['data']);

        }
    )
}

$(function() {

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