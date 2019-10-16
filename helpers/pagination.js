exports.generatePageRange = function(currentPage, lastPage, delta = 2) {
    // creates array with base 1 index
    const range = Array(lastPage)
        .fill()
        .map((_, index) => index + 1);

    const reduced = range.reduce((pages, page) => {
        // allow adding of first and last pages
        if (page === 1 || page === lastPage) {
            return [...pages, page];
        }

        // if within delta range add page
        if (page - delta <= currentPage && page + delta >= currentPage) {
            return [...pages, page];
        }

        // otherwise add 'gap if gap was not the last item added.
        if (pages[pages.length - 1] !== '...') {
            return [...pages, '...'];
        }

        return pages;
    }, []);

    console.log(reduced);

    return reduced;
};
