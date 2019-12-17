/* eslint-env jquery, browser */
$(document).ready(() => {
    $('input[name=date_from]').inputmask('9999-99-99', { placeholder: 'YYYY-MM-DD' });
    $('input[name=date_to]').inputmask('9999-99-99', { placeholder: 'YYYY-MM-DD' });
});
