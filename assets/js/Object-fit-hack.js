/**
* Object-fit hack
*/
(function () {
  var isSupports = ('object-fit' in document.body.style);

  if (isSupports) {
    return;
  }

  $('.image-container.is-cover').each(function () {
    var $container = $(this),
    imgUrl = $container.find('img').prop('src');
    if (imgUrl) {
      $container.css('backgroundImage', 'url(' + imgUrl + ')').addClass('with-trick');
    }
  });
})();
