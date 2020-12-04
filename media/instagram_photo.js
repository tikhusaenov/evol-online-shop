/**
 * InstagramPhotos
 * Получаем массив фотографий из инстаграмма
 *
 * var myInstagram = new InstagramPhotos({
   user_id: 1111111,
   access_token: '111111.1677ed0.9844c23093e34ff290cd09d941e22535',
   countPhoto: 20,
   done: function (photos) {
     // тут рисуем вывод фотографий
   },
   fail: function (error) {
     if (error.meta) {
       console.warn(error.meta.error_message);
     }
   }
 });
 */

function InstagramPhotos(options) {
  var self = this;

  var DEFAULT_OPTIONS = {
    user_id: null,
    access_token: null,
    countPhoto: 20,
    filterImages: null, // function (image){ return image.tags.indexOf('beauty') > -1 }
    done: function () {},
    fail: function () {}
  }

  self.options = $.extend(true, DEFAULT_OPTIONS, options);

  self.init();
}

InstagramPhotos.prototype.init = function () {
  var self = this;

  var isValid = self.validOption(self.options);

  if (!isValid) {
    console.log('Не заполнен user_id или access_token');
    return;
  }

  self.getPhoto();
};

InstagramPhotos.prototype._filter = function (images) {
  var self = this;
  var result = [];


    $.each(images, function(index, el) {
       if (self.options.filterImages && self.options.filterImages(el)) {
         result.unshift(el)
       }
    });


  return result;
}

InstagramPhotos.prototype.validOption = function (options) {
  return options.user_id && options.access_token;
}

InstagramPhotos.prototype.getPhoto = function () {
  var self = this;
  var options = self.options;
  var url = 'https://api.instagram.com/v1/users/' + options.user_id + '/media/recent';
  var access_token = options.access_token;
  var countPhoto = options.countPhoto;
  var done = options.done;
  var fail = options.fail;

  $.ajax({
    url: url,
    dataType: 'jsonp',
    type: 'GET',
    data: {
      access_token: access_token,
      count: countPhoto
    }
  })
  .done(function(result) {
    if (result.meta && result.meta.code == 200) {
      if (self.options.filterImages) {
        done(self._filter(result.data));
      }else{
        done(result.data);
      }
    }else{
      fail(result);
    }
  })
  .fail(function(error) {
    fail(error);
  })
};
