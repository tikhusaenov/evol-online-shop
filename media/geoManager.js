/**
 * Определение geo позиции
 *
 *
 * Зависимости:
 * jQuery
 * localforage (//cdnjs.cloudflare.com/ajax/libs/localforage/1.4.3/localforage.min.js)
 *
 * Параметры:
 * succes - колбек на получение данных
 * debug - выводит уведомления о процессах
 * use_forage - юзать localforage
 * clear_forage - очистить localforage при запуске
 * keyParameters - ключ в котором хранятся данные localforage
 *
  Пример вызова:
  var myGeo = new GeoManager({
   succes: function (geoData) {
     console.log(geoData);
   },
   debug: true
 })
 *
 */
 var GeoManager = function (options) {
   var self = this;

   var DEFAULT_OPTIONS = {
     debug: false,
     clear_forage: false,
     use_forage: true,
     keyParameters: 'user_geo',
     succes: function () {}
   }

  self.option = $.extend(DEFAULT_OPTIONS, options);

  self.setLog('Настройки плагина', self.option);

  self.init();
}

/**
 * Инициализация
 */
GeoManager.prototype.init = function () {
  var self = this;

  // Если в настройка очистить сторадж при запуске
  if (self.option.clear_forage && localforage) {
    localforage.removeItem(self.option.keyParameters, function () {
      self.setLog('Локальное хранилище очищено', 'Ключ: ' + self.option.keyParameters);
    })
  }

  if (typeof window.localforage == "undefined") {
    console.warn('Не подключен плагин localforage!');
  }

  // получить гео данные
  self.getGeoData().done(function (geoData) {
    self.setLog('Вызов колбека succes');
    self.option.succes(geoData);

  }).fail(function (err) {
    self.setLog('Не удалось получить данные', err);
  });
};

/**
 * Получаем гео данные
 */
GeoManager.prototype.getGeoData = function () {
  var self = this;
  return $.when(_getGeoData())

  function _getGeoData() {
    var dfd = jQuery.Deferred();

    if (window.localforage && self.option.use_forage) {
      // пробуем забрать данные из хранилища
      self.getLocalData().done(function (geoData) {
        dfd.resolve( geoData );
      }).fail(function () {
        // если хранилище пусто, забираем из kladr.insales.ru
        self.getKladrData().done(function (geoData) {
          dfd.resolve( geoData );
        }).fail(function (err) {
          dfd.reject( err );
        });
      });
    }else{
      self.getKladrData().done(function (geoData) {
        dfd.resolve( geoData );
      }).fail(function (err) {
        dfd.reject( err );
      });
    }

    return dfd.promise();
  }
};

// Получить данные из хранилища
GeoManager.prototype.getLocalData = function () {
  var self = this;
  return $.when(_getLocalData())

  function _getLocalData() {
    var dfd = jQuery.Deferred();

    localforage.getItem(self.option.keyParameters, function(err, localData) {
      if (localData) {
        self.setLog('Данные получены из хранилища', localData);

        dfd.resolve( localData );
      }else{
        self.setLog('Хранилище пусто, данные будут запрошены в kladr.insales.ru');

        dfd.reject('Хранилище пусто');
      }
    });

    return dfd.promise();
  }
};

// Получить данные из kladr.insales.ru
GeoManager.prototype.getKladrData = function () {
  var self = this;
  return $.when(_getKladrData())

  function _getKladrData() {
    var dfd = jQuery.Deferred();

    $.ajax({
      url: 'https://kladr.insales.ru/current_location.json',
      type: 'get',
      dataType: 'jsonp',
    })
    .done(function(kladrData) {
      self.setLog('Данные получены из kladr.insales.ru', kladrData);
      if (window.localforage && self.option.use_forage) {
        localforage.setItem(self.option.keyParameters, kladrData);
      }

      dfd.resolve( kladrData );
    })
    .fail(function(err) {
      self.setLog('Произошла ошибка при получении данных из kladr.insales.ru', err);
      dfd.reject( err );
    })

    return dfd.promise();
  }
};

// Установить свои данные
GeoManager.prototype.setLocalData = function (newLocals, _setCallback) {
  var self = this;
  var setCallback = _setCallback || function () {};
  if (window.localforage && self.option.use_forage) {
    localforage.setItem(self.option.keyParameters, newLocals, function(err, newlocalData) {
      if (newlocalData) {
        self.setLog('В хранилище обновлены данные через метод setLocalData', newlocalData);
        setCallback(newlocalData);
        self.option.succes(newlocalData);
      }else{
        self.setLog('Не удалось обновить данные');
      }
    });
  }
};

// Инициализировать страны
GeoManager.prototype.initCountry = function () {
  var self = this;

  _.forEach(self.option.cityList, function (_city) {

    if (!self.option.countries[_city.country_name]) {
      self.option.countries[_city.country_name] = {
        cities: [],
        title: _city.country_name
      }
    }

    self.option.countries[_city.country_name].cities.push(_city)
    self.option.countries[_city.country_name].title = _city.country_name
  });
}

// Инициализировать поля магазинов
GeoManager.prototype.initShops = function () {
  var self = this;

  _.forEach(self.option.cityList, function (_city) {
    _city.shops = _.orderBy(_city.shops, ['isOfical'], ['desc']);

    _.forEach(_city.shops, function (_shop) {
      var _templateBaloon = $('[data-template-id="baloon-content"]').html();
      var compiledTemplateBaloon = _.template(_templateBaloon);
      var _contBal = '';
      var _shopContent = compiledTemplateBaloon({shop_content: _shop});
      var _balContent = _shop.baloon;
      if (_shopContent) {
        _contBal = _shopContent;
      }
      if (_balContent) {
        _contBal += '<br>' + _balContent;
      }

      _shop.balloonContent = _contBal;
    });
  });
}


// Фильтровать города без магазинов
GeoManager.prototype.filterCities = function () {
  var self = this;

  self.option.cityList = _.reduce(self.option.cityList, function(result, value, key) {
    if (self.option.cityList[value.keyTitle] && self.option.cityList[value.keyTitle].shops.length > 0 || (self.option.majorCities[value.keyTitle] && self.option.majorCities[value.keyTitle].subCities)) {
      result[value.keyTitle] = value;
    }else{
      self.setLog('В городе отсутствуют магазины', value)
    }

    return result;
  }, {});
}

// по алфавиту
GeoManager.prototype.initAlphabet = function () {
  var self = this;
  var _orderCity = _.orderBy(self.option.cityList, ['title'], ['asc']);

  $.each(_orderCity, function(index, el) {
    var _alfa = _.toLower(el.title.charAt(0));
    if (!self.option.alphabetList[_alfa]) {
      self.option.alphabetList[_alfa] = {
        title: _.toUpper(_alfa),
        list: []
      }
    }

    self.option.alphabetList[_alfa].list.push(el)
  });

  self.setLog('Сортировка по алфавиту', self.option.alphabetList)
}

// по основным городам
GeoManager.prototype.initParents = function () {
  var self = this;
  self.option.majorCities = {};

  $.each(self.option.cityList, function(index, el) {
    if (el.isParent) {
      if (self.option.majorCities[ el.keyTitle ]) {
        self.option.majorCities[ el.keyTitle ].city = el
      }else{
        self.option.majorCities[ el.keyTitle ] = {
          subCities: [],
          city: el
        }
      }
    }else{
      if (el.parentCity && el.parentCity != '') {
        if (self.option.majorCities[ _.toLower(el.parentCity) ]) {
          self.option.majorCities[ _.toLower(el.parentCity) ].subCities.push(el)
        }else{
          self.option.majorCities[ _.toLower(el.parentCity) ] = {
            subCities: []
          }
          self.option.majorCities[ _.toLower(el.parentCity) ].subCities.push(el)
        }
      }
    }
  });
}


// Дебагер
GeoManager.prototype.setLog = function (_name, _variable) {
  var self = this;
  if (self.option.debug) {
    console.info('==GeoManager==');
    console.log(_name);
    if (_variable) {
      console.log(_variable);
    }
    console.log('/////////////////');
    console.log('///GeoManager///');
    console.log('///////////////');
  }
};
