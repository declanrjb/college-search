$(function() {

    $('.search-button').on('click', function() {

        var query = 'https://college-search.onrender.com/search?q=' + $('.college-search-input').val();

        console.log('sending...')

        $.getJSON(query, 
            function(data) {
                console.log(data)
                var results = data['completions']

                for (var i=0; i<results.length; i++) {
                    $('.completions-holder').append(
                        `
                        <div class="completion">
                            NAME_PLACEHOLDER
                        </div>
                        `.replace('NAME_PLACEHOLDER', results[i]['INSTNM'])
                    )
                }

                // $('.result').on('click', function(e) {
                //     window.location.href = e.currentTarget.getAttribute('url');
                // })
            }
        )

    })
})