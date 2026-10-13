$(function () {
    drawSkewbNet();

    // Mobile only: switches between the timer view and the times view
    $('.sh-tab').on('click', function () {
        $('.sh-main').attr('data-view', $(this).data('view'));
        $('.sh-tab').removeClass('active');
        $(this).addClass('active');
    });
});