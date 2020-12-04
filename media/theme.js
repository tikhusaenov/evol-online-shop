var accountConfigData = $('[name="shop-config"]').data('config');
/**
 * ARTICLE_CONTENT
 */
$(document).ready(function() {
  $(document).on("click", ".article-text img", function(event) {
    BigPicture({
      el: event.target
    });
  });

  $('.page-content table, .editor table').each(function(index, el) {
    var elWidth = $(el).width();
    var parentWidth = $(el).parent().width();
    if (elWidth > parentWidth) {
      $(el).addClass('table-responsive');
    }
  });
});

/**
 * CART
 */
$(document).ready(function() {
  var mainCart = new CartMan({
    declination: ["товар", "товара", "товаров"],
    hideCartItems: true, // Скрывать поля корзины при удалении? [data-item-id]
    counterTemplate: "(%c%)", // regexp %c% (%c% - counter)
    counterTemplateEmpty: null, // regexp %c% (Шаблон для пустой корзины)
    positionsTemplate: "(%c%)", // regexp %c% (%c% - counter)
    positionsTemplateEmpty: null, // regexp %c% (Шаблон для пустой корзины)
    counterItemsText: "В вашей корзине %c%&nbsp;%w%", // regexp %c%,%w% (%c% - counter, %w% - word)
    counterItemsTextEmpty: "В вашей корзине %c%&nbsp;%w%", // regexp %c%,%w% (%c% - counter, %w% - word)
    counterPositionText: "В вашей корзине %c%&nbsp;%w%", // regexp %c%,%w% (%c% - counter, %w% - word)
    counterPositionTextEmpty: "В вашей корзине %c%&nbsp;%w%", // regexp %c%,%w% (%c% - counter, %w% - word)
    updateItems: function(cart) {
      if (cart.order_lines.length == 0) {
        $("[data-cart-quick]").hide();
        $(".cart_sidebar").hide();
        $(".cart-item").hide();
        $(".cart-empty").removeClass("hide");
      }
      updateDiscount(cart);
    }
  });
});

function updateDiscount(cart) {
  if($('[data-discounts]').length == 0){
    return;
  }

  //  Обработка купона
  var discountsHtml =  '<div class="row flex-middle flex-between">';

  if(cart.errors && cart.errors.length > 0){
    for(var i = 0; i < cart.errors.length; i++){
      discountsHtml += '<div class="cell-12 m-b-10">' + cart.errors[i] + '</div>';
    }
  } else if (typeof cart.coupon !== 'undefined' && !cart.coupon.valid && cart.coupon.error) {
    discountsHtml += '<div class="cell-12 m-b-10">' + cart.coupon.error + '</div>';
  } else{
    for(var i = 0; i < cart.discounts.length; i++){
      var disc = cart.discounts[i];
      if(disc.percent == null){
        var discPrice = Shop.money.format(disc.discount);
      } else{
        var discPrice = '-' + disc.discount + '%';
      }

      discountsHtml += '<div class="cell-">' + disc.description + '</div>';
      discountsHtml += '<div class="cell-">' + discPrice + '</div>';
    }
  }

  discountsHtml += '</div>';

  $('[data-discounts]').html(discountsHtml);

  $('[data-basket-total-price]').html(Shop.money.format(cart.total_price));

  if(!cart.coupon) {
    $('[data-item-coupon]').val('');
  }else{
    var fldLength = cart.coupon.value.length;
    $('[data-item-coupon]').val(cart.coupon.value);
    if(cart.action && cart.action.method == "set_coupon") {
      $('[data-item-coupon]').get(0).setSelectionRange(fldLength, fldLength);
    }
  }
}

/**
 * CATEGORY
 */
$(document).ready(function() {
  $(".category_menu-item[data-tabs-container]").dataTabs({
    state: "accordion",
    useJqMethods: false
  });
});

/**
 * COLLECTION_FILTERS
 */
$(document).ready(function() {
  initCollectionFilter();

  $(document).on("click", "[data-open-filter]", function(event) {
    event.preventDefault();

    var thisEl = $(this);

    if(thisEl.hasClass('active')){
      thisEl.removeClass('active');
      $('[data-closed-filter]').removeClass('active');

      setTimeout(function(){
        $('[data-opened-filter]').addClass('cell-12').removeClass('cell-9');
      }, 500);
    } else{
      thisEl.addClass('active');
      $('[data-opened-filter]').addClass('cell-9').removeClass('cell-12');

      if($(window).width() >= 769){
        var scrollTo = thisEl.attr('href');

        var destination = $(scrollTo).offset().top - 20;
        jQuery("html:not(:animated),body:not(:animated)").animate({
          scrollTop: destination
        }, 800);
      }
      

      console.log(destination);

      setTimeout(function(){
        $('[data-closed-filter]').addClass('active');
      }, 500);
    }

  });

  $(document).on("click", "[data-close-filter]", function(event){
    event.preventDefault();

    $('[data-open-filter]').removeClass('active');
    $('[data-closed-filter]').removeClass('active');

    setTimeout(function(){
      $('[data-opened-filter]').addClass('cell-12').removeClass('cell-9');
    }, 500);
  });

  if($(window).width() > 768){
    $('[data-filter-active]').each(function(){
      $('[data-open-filter]').addClass('active');
      $('[data-opened-filter]').addClass('cell-9').removeClass('cell-12');

      setTimeout(function(){
        $('[data-closed-filter]').addClass('active');
      }, 500);
    });
  }
});

function initCollectionFilter() {
  $(".js-filter-section").dataTabs({
    state: "accordion",
    useJqMethods: false
  });
  $(".js-filter-range-slider").rangeSlider({
    force_edges: true
  });
  $(".js-filter-range-slider-price").rangeSlider({
    force_edges: true
  });
}

$(function() {
  $(document).on("change", ".js-filter-trigger", function(event) {
    var thisEl = $(this);
    var thisForm = thisEl.parents('form:first');
    var defaultSize = $('.js-show-page-size').html();
    var order_val = thisForm.find('[name="order"]').val();
    var page_size = thisForm.find('[name="page_size"]').val();

    formData = new FormData(thisForm.get(0));

    if(order_val == ''){
      $('[name="order"]').attr('disabled', 'disabled');
    }
    if(page_size == defaultSize){
     $('[name="page_size"]').attr('disabled', 'disabled');
    }

    thisForm.submit();
  });
  $(document)
    .on("click", "form label", function(event) {
      var $form = $(this).parents("form:first");
      var $filterItem = $(this).parents(".filter-item");
      var $checkbox = $filterItem.find(":checkbox");

      if ($form.hasClass("collection-filter")) {
        event.preventDefault();
        $checkbox.prop("checked", !$checkbox.prop("checked")).trigger("change");
      }
    })
    .on("change", "input:not(.js-filter-range-placeholder), select", function(
      event
    ) {
      var $form = $(this).parents("form:first");

      sendFilter($form, $(this));
    })
    .on("click", '[type="submit"]', function(event) {
      var $form = $(this).parents("form:first");

      if ($form.hasClass("collection-filter")) {
        event.preventDefault();
        sendFilter($form, $(event.target));
      }
    })
    .on("check", ".collection-filter", function(event) {
      sendFilter($(this), $(this));
    });

  function sendFilter($form, $source) {
    if (!$form.hasClass("collection-filter")) {
      return false;
    }

    var isSubmitOnChange = $form.data("submit-onchange");
    var isButton = $source.is("button");

    if (isSubmitOnChange || isButton) {
      $form.submit();
    }
  }
});

/**
 * COLLECTIONINFINITY
 */
$(document).ready(function() {
  /**
   * data-collection-infinity="{{ paginate.next.url }}"
   * атрибут стоит на родителе карточек коллекции
   */

  if ($("[data-collection-infinity]").length) {
    var html = document.documentElement;
    $(window).on("scroll", function(event) {
      var scrollTop = html.scrollTop || (body && body.scrollTop) || 0;
      scrollTop -= html.clientTop;
      var part = 1.7; // на это число разделиться высота контейнера с товарами

      var collscroll =
        $("[data-collection-infinity]").get(0).offsetTop +
        $("[data-collection-infinity]").outerHeight() / part;

      if (scrollTop > collscroll) {
        collectionInfinity();
      }
    });
  }

  // массив tempPage хранит метки страниц которые уже загрузили
  var tempPage = [];
  function collectionInfinity() {
    var _nextPage = $("[data-collection-infinity]").data("collection-infinity");
    if (_nextPage && _nextPage != "") {
      if (tempPage.indexOf(_nextPage) > -1) {
        return;
      }
      tempPage.push(_nextPage);
      $("body").addClass("body--loading");

      // грузим контент
      $.ajax({
        url: _nextPage,
        dataType: "html"
      })
        .done(function(_dom) {
          var $dom = $(_dom);
          var $next = $dom.find("[data-collection-infinity]");
          var _next = $next.data("collection-infinity");
          $("[data-collection-infinity]").append($next.html());
          $("[data-collection-infinity]")
            .data("collection-infinity", _next)
            .attr("data-collection-infinity", _next);

          $("[data-product-id]").each(function(index, el) {
            Products.initInstance($(el));
          });
        })
        .always(function() {
          $("body").removeClass("body--loading");
        });
    }
  }
});

/**
 * COMPARE_PRODUCT
 */
$(document).ready(function() {
  var _CompareProducts = new CompareProducts({
    counterTemplate: "(%c%)", // regexp %c%
    counterTemplateEmpty: null, // regexp %c%
    buttonNotAddedText: null, // текст не активной кнопки
    buttonAddedText: null, // текст активной кнопки
    titles: {
      added: "Добавлен в сравнение",
      notAdded: "В сравнение"
    },
    onAdd: function(data) {
      alertify.success("Товар добавлен в сравнение");
    },
    onRemove: function(data) {
      alertify.message("Товар удален из сравнения");
    },
    onUpdate: function(data) {
      // обновление
    },
    onInit: function(data) {
      // инициализация
    },
    onOverload: function(data) {
      alertify.warning(
        "Достигнуто максимальное количество сравниваемых товаров - " +
          data.maxItems
      );
    }
  });
});

/**
 * COMPARES_BODY
 */
$(function() {
  var $compareCount = $(".js-compare-amount");
  var $compareTable = $(".js-compare-table");

  var compareWrapper = "#js-compare-wrapper";
  var compareInner = "#js-compare-inner";
  var compareUrl = document.location.href;

  EventBus.subscribe("before:insales:compares", function() {
    if (Site.template == "compare") {
      $('<div class="preloader is-white is-32"></div>')
        .prependTo($(compareWrapper))
        .fadeIn("fast");
    }
  });

  EventBus.subscribe("init:insales:compares", function(data) {
    for (i = 0; i < data.products.length; i++) {
      $('[data-compare="' + data.products[i].id + '"] .compare-add').addClass(
        "active"
      );
      $('[data-comp-id="' + data.products[i].id + '"]').removeClass("hide");
    }
    $compareCount.html(data.products.length);
  });

  EventBus.subscribe("remove_item:insales:compares", function(data) {
    if (Site.template == "compare") {
      $("[data-compared-id=" + data.action.item + "]").fadeOut(300, function() {
        $(this).remove();
      });
    }
  });

  EventBus.subscribe("update_items:insales:compares", function(data) {
    for (i = 0; i < data.products.length; i++) {
      $('[data-comp-id="' + data.products[i].id + '"]').removeClass("hide");
    }

    if (data.products.length == 0) {
      $(".compare-toolbar").fadeOut("slow");
      $(".table-compare")
        .fadeOut("slow")
        .html(
          '<div class="notice notice-info text-center">Список сравнения пуст</div>'
        )
        .fadeIn("slow");
    } else {
      $(compareWrapper).load(compareWrapper + " " + compareInner, function() {
        if (!$.cookie("compare-view") && $(".product-title").length > 1) {
          $(sameRows).hide();
          $(compareViewToggler).addClass("active");
        }
      });
    }

    $(".preloader").fadeOut("fast", function() {
      $(this).remove();
    });
  });

  /**
   * COMPARE VIEW
   * Настройка переключалки видимости блоков
   * @type {string}
   */
  var compareViewToggler = ".js-same-toggle";
  var sameRows = ".same-row";

  if (!$.cookie("compare-view") && $(".product-title").length > 1) {
    $(sameRows).hide();
    $(compareViewToggler).addClass("active");
  }

  $(document).on("click", compareViewToggler, function(e) {
    e.preventDefault();

    $(compareViewToggler).toggleClass("active");
    $(sameRows).toggle();

    if (!$(this).hasClass("active")) {
      $.cookie("compare-view", "true");
    } else {
      $.removeCookie("compare-view");
    }
  });
});

/**
 * DECLINATION
 */
/**
 * Склонение слов
 * @param  {number} _day  число
 * @param  {array} titles массив слов
 * @return {string}       склонение
 *
 * declinationText(2, ['человек', 'человека', 'человек'])
 * => 'человека'
 */
var declinationText = function(_day, titles) {
  var day = Math.round(_day);
  var _titles = ["товар", "товара", "товаров"];
  if (titles) {
    _titles = titles;
  }
  var cases = [2, 0, 1, 1, 1, 2];
  return _titles[
    day % 100 > 4 && day % 100 < 20 ? 2 : cases[day % 10 < 5 ? day % 10 : 5]
  ];
};

/**
 * FAVORITE
 */
var Favorite = {};
$(document).ready(function() {
  window.Favorite = new Favorites({
    counterTemplate: "%c%",
    //buttonNotAddedText: 'Добавить в избранное',
    //buttonAddedText: 'Удалить из избранного',
    onAdd: function() {
      alertify.success("Товар добавлен в избранное");
    },
    onRemove: function() {
      alertify.error("Товар удален из избранного");
    },
    onUpdate: function(data) {
      var isFavoritePage = $(".js-favorite").length > 0;
      if (isFavoritePage) {
        // Рендер списка
        $(".js-favorite").html(Template.render(data, "favorite"));

        // инициализация инстансов нужна после динамического добавления товаров
        Products.getList(_.map(data.products, "id"));
        Favorite.checkFavoritesProducts();
      }
    }
  });
});

$(document).ready(function() {
  if (window.innerWidth  <= 768){
    if ($('.hidden-breadcrumbs').hasClass("js-hidden-bread")){

      $('.breadcrumb-item').each(function(index){
        if ((index > 2) && (index != $(".breadcrumb-item").size() - 1))
        {
          $(this).not('.button-breadcrumb').addClass("hidden");
        }
      })
      $('.js-hidden-bread').click(function(){
        $('.breadcrumb-item').removeClass("hidden");
        $('.js-hidden-bread').parent().addClass("hidden");
      })
    }
  }
});

/**
 * FIXED_HEADER
 */
$(document).ready(function() {
  var fixed_header = new DetectiveScroll({
    trigger: {
      el: $(".fixed_header"),
      scroll: $(".main-header").outerHeight()
    }
  });
});

/**
 * HITS
 */
$(document).ready(function() {
  var hitsSlider = InitSwiper($(".js-hits .js-products-slider"), {
    autoLength: true,
    loop: true,
    minCartWidth: 270,
    spaceBetween: 30,
    autoResponsive: true
  });

  $(".js-hits").dataTabs({
    onInit: function() {
      setTimeout(function() {
        $.each(hitsSlider, function(index, el) {
          el.update();
        });
      }, 100);
    },
    onTab: function() {
      $.each(hitsSlider, function(index, el) {
        el.update();
      });
    }
  });
});

/**
 * INSTAGRAM
 */
$(document).ready(function() {
  if ($(".js-instagram").length) {
    // Получаем фотографии из API
    var myInstagram = new InstagramPhotos({
      user_id: 5720831737,
      access_token: "5720831737.1677ed0.75c5924295bb49eaa35c62372aabfd64",
      countPhoto: 20,
      // filterImages: function (image){
      //   return image.likes.count > 0
      // },
      done: function(photos) {
        console.log(photos);
        $(".js-instagram .swiper-container").html(
          templateLodashRender({ photos: photos }, "insta-footer")
        );

        setTimeout(function() {
          instaSlider();
        }, 100);
      },
      fail: function(error) {
        if (error.meta) {
          console.warn(error.meta.error_message);
        }
      }
    });
  }

  function instaSlider() {
    var instagramSlider = InitSwiper(".js-instagram", {
      autoLength: true,
      minCartWidth: 300,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      speed: 600,
      setWrapperSize: true,
      paginationClickable: true,
      loop: true,
      preventClicks: true,
      controlBy: "container",
      spaceBetween: 0
    });
  }
});

/**
 * MOBILE_MENU
 */
$(document).ready(function() {
  $(document).on("click", "[data-open-mobile]", function(event) {
    event.preventDefault();
    var target =
      '[data-target-mobile-menu="' + $(this).data("open-mobile") + '"]';
    alertify.panel({
      target: target,
      position: "left",
      onOpen: function() {
        $("body").addClass("open-collection-filter");
        $("body").addClass("open-mobile-menu");
        $(".mobile_menu-item.level-1[data-tabs-container]").dataTabs({
          state: "accordion"
        });
      },
      onclose: function() {
        $("body").removeClass("open-collection-filter");
        $("body").removeClass("open-mobile-menu");
      }
    });
  });
});

/**
 * MODALS
 */
$(document).ready(function() {
  $.fancybox.defaults.animationEffect = "zoom-in-out";

  $(document).on("afterShow.fb", function(e, instance, slide) {
    if($(instance.$trigger).length && typeof $(instance.$trigger).attr('id') == 'string' && $(instance.$trigger).attr('id').indexOf('image_gallery_') > -1){
        $('.js-product-gallery-main').get(0).swiper.slideTo(instance.currIndex);
      }
    if (MagicZoom) {
      $(".mz-zoom-window").remove();
      MagicZoom.refresh();
    }
  });
  $(document).on("click", ".added-close", function(event) {
    event.preventDefault();
    $.fancybox.close();
  });

  $(document).on("click", ".js-modal", function(event) {
    event.preventDefault();

    $.fancybox.open({
      src: $(this).attr("href"), // Source of the content
      type: "inline"
    });
  });

  $(document).on("click", "[data-open-mobile-menu]", function(event) {
    event.preventDefault();
    alertify.panel({
      target: ".mobile_menu",
      position: "left"
    });
  });

  $(".js-feedback").InSalesFeedback({
    require: ["phone"],
    // фразы ошибок под инпутом
    errorMessages: {
      from: Site.messages.t_errorMessages_from,
      phone: Site.messages.t_errorMessages_phone,
      name: Site.messages.t_errorMessages_name,
      subject: Site.messages.t_errorMessages_subject,
      agree: Site.messages.t_errorMessages_agree,
      content: Site.messages.t_errorMessages_content
    },
    // фразы блоков data-feedback-success/data-feedback-error
    messages: {
      send_from: Site.messages.feedback_sent,
      product: Site.messages.label_product,
      sku: Site.messages.label_article,
      default_value: Site.messages.feedback_name,
      success: Site.messages.t_errorMessages_success,
      fail: Site.messages.t_errorMessages_fail,
      error: Site.messages.t_errorMessages_error
    },
    useAgree: true,
    showMessageAgree: true,
    onError: function(data) {
      // Ошибка валидации
      console.log(data);
    },
    onSuccess: function(data) {
      // сообщение успешно отправлено
      setTimeout(function() {
        $.fancybox.close();
      }, 5000);
    },
    onFail: function(data) {
      // Ошибка при отправке сообщения
      console.log(data);
    }
  });

  $(".js-feedback-page").InSalesFeedback({
    // фразы ошибок под инпутом
    errorMessages: {
      from: Site.messages.t_errorMessages_from,
      phone: Site.messages.t_errorMessages_phone,
      name: Site.messages.t_errorMessages_name,
      subject: Site.messages.t_errorMessages_subject,
      agree: Site.messages.t_errorMessages_agree,
      content: Site.messages.t_errorMessages_content
    },
    // фразы блоков data-feedback-success/data-feedback-error
    messages: {
      send_from: Site.messages.feedback_sent,
      product: Site.messages.label_product,
      sku: Site.messages.label_article,
      default_value: Site.messages.feedback_name,
      success: Site.messages.t_errorMessages_success,
      fail: Site.messages.t_errorMessages_fail,
      error: Site.messages.t_errorMessages_error
    },
    require: ["from", "content"],
    useAgree: true,
    useDefaultContent: false,
    showMessageAgree: true,
    onError: function(data) {
      // Ошибка валидации
      console.log(data);
    },
    onSuccess: function(data) {
      // сообщение успешно отправлено
      setTimeout(function() {
        $.fancybox.close();
      }, 5000);
    },
    onFail: function(data) {
      // Ошибка при отправке сообщения
      console.log(data);
    }
  });

  // Фикс для заказа в один клик
  $(document).on("click", "[data-quick-checkout]", function(event) {
    $.fancybox.close();
  });
});

/**
 * PRODUCT_INFO
 */

$(document).ready(function() {
  var optionVariant = $('[data-option-variant]').html();

  Products.setConfig({
    initOption: true,
    filtered: false,
    showVariants: true,
    useMax: accountConfigData.forbid_order_over_existing,
    decimal: {
      // мм
      mmt: 0,
      // см
      cmt: 0,
      // дм
      dmt: 0,
      // м
      mtr: 3,
      // км
      kmt: 3,
      // дюйм
      inh: 1,
      // фут
      fot: 3,
      // ярд
      yrd: 3,
      // м2
      mtk: 3,
      // дм2
      dmk: 0,
      // мл
      mlt: 0,
      // см3
      cmq: 0,
      // л
      ltr: 3,
      // дм3
      dmq: 3,
      // м3
      mtq: 3,
      // г
      grm: 0,
      // кг
      kgm: 3,
      // т
      tne: 2,
      // час
      hur: 0,
      // боб??
      nbb: 0,
      // лист
      lef: 0,
      // набор
      set: 0,
      // пар
      npr: 0,
      // рул
      npl: 0,
      // упак
      nmp: 0,
      // дюжина упак
      dzp: 0,
      // 100 упак
      cnp: 0,
      // шт
      pce: 0,
      // 100 шт
      cen: 0,
      // тыс. шт
      mil: 0,
      // ящ
      box: 0,
      // секц
      sct: 0,
      // флак
      btl: 0,
      // пог.м
      lmt: 3
    },
    fileUrl: typeof fileUrl == "undefined" ? {} : fileUrl,
    options: {
      //'Цвет': 'option-image',
      default: optionVariant
    }
  });
});

function updateProduct(){
  window.myVariants = new VariantsModifier({
    updateVariant: function(data, $form) {
      if (!data.available) {
         $($form).find('[data-item-add]').prop('disabled', true)
         $($form).find('[data-quick-checkout]').prop('disabled', true)
      }else{
        $($form).find('[data-item-add]').prop('disabled', false)
        $($form).find('[data-quick-checkout]').prop('disabled', false)
      }

      $($form).find('.product-buy').addClass('is-active');
      
      var dataPrice = data.price * 1;
      var dataOldPrice = data.old_price * 1;
      
      if(dataPrice >= dataOldPrice){
        console.log($('[data-product-old-price]').html(''));
      } 
    },
    selectors: {
      oldPrice: "[data-product-old-price]",
      price: "[data-product-price]",
      sku: "[data-product-sku]",
      quantity: "[data-quantity-message]",
      available: "[data-product-available]"
    },
    templates: {
      price: "%s%",
      oldPrice: "%s%",
      emptyOldPrice: "",
      sku: Site.messages.js_label_article + " %s%",
      emptySku: "",
      available: Site.messages.js_available,
      notAvailable: Site.messages.js_notAvailable,
      quantityEnds: Site.messages.js_quantityEnds,
      quantityAlot: Site.messages.js_quantityAlot,
      quantityNotAvailable: Site.messages.js_quantityNotAvailable
    },
    productGallery: null, // Слайдер с изображениями товара
    quantityEnds: 10, // граница между заканчивается и много
    initVariantImage: true, // Выбор слайда при инициализации?
    updateVariantFromSlider: false, // Обновлять вариант при перелистывании слайдов
    useToggleOldPrice: true, // использовать show/hide на old price?
    useToggleSku: true, // использовать show/hide на sku?
    checkQuantityVariant: true, // проверять остаток варианта? Иначе продукта.
    quantityNull: "quantityAlot" // Если кол-во не заполнено quantityEnds/quantityAlot/quantityNotAvailable
  });

}

/**
 * PRODUCT_TABS
 */
function updateTabs(){
  $(".js-tabs").dataTabs({
    state: "tab", // роль плагина tab/accordion
    event: "click",
    activeIndex: 1, // активный элемент
    speedSwitching: 5000, // скорость авто переключения
    useToggle: false, // Скрытие активных вкладок
    autoSwitching: false, // авто переключение
    hideOnClosest: false, // hide on closest
    hideOnMouseout: false, // hide on Mouseout
    prevent: true, // preventDefault
    debug: false, // дебагер
    useHash: true, // использовать window.location.hash
    useJqMethods: true, // использовать jq методы анимаций?
    loop: false, // замкнуть цикл при переключении?
    initOpenTab: true, // инициализировать активный таб?
    pauseVideoAudio: true, // ставить на паузу аудио и видео при переключении табов?
    mouseoutTimeOut: false, // таймаут после снятия курсора
    jqMethodOpenSpeed: 300, // скорость открытия табы
    jqMethodOpen: "fadeIn", // jq метод открытия табы
    jqMethodCloseSpeed: 0, // скорость закрытия табы
    jqMethodClose: "hide", // jq метод закрытия табы
    onInit: function() {}, // плагин инициализировался (onInit)
    onTab: function() {}, // переключили таб (self)
    onMouseover: function() {}, // навели на блок табов (event, self)
    onMouseout: function() {} // убрали курсор с блока табов (event, self)
  });
}

$(document).ready(function(){
  updateProduct();
  updateTabs();
});


/**
 * PRODUCT-GALLERY
 */

$(document).ready(function() {
  var $galleryThumbs = ".gallery-wrapper .js-gallery-thumbs";
  var $galleryMain = ".gallery-wrapper .js-product-gallery-main";
  var index = $($galleryMain).find('[href="'+$($galleryMain).data('first-image')+'"]').parent().index();
  galleryInit($galleryThumbs, $galleryMain, index);
});

function galleryInit(galleryThumbs, galleryMain, initialSlide) {
  var $galleryThumbs = $(galleryThumbs);
  var $galleryMain = $(galleryMain);
  var initialSlide = initialSlide || 0;

  var galleryThumbsSlider = new Swiper(galleryThumbs, {
    loopedSlides: $(galleryThumbs + " .swiper-wrapper .swiper-slide").length,
    spaceBetween: 10,
    navigation: {
      nextEl: ".swiper-button-next.is-thumb",
      prevEl: ".swiper-button-prev.is-thumb"
    },
    speed: 200,
    loop: false,
    slidesPerView: 4,
    touchRatio: 0.2,
    initialSlide: initialSlide,
    slideToClickedSlide: false
  });

  var galleryTop = new Swiper(galleryMain, {
    loopedSlides: $(galleryMain + " .swiper-wrapper .swiper-slide").length,
    navigation: {
      nextEl: ".swiper-button-next.is-gallery",
      prevEl: ".swiper-button-prev.is-gallery"
    },
    speed: 300,
    loop: false,
    initialSlide: initialSlide,
    spaceBetween: 0,
    autoHeight: false,
    autoHeight: true
  });

  galleryTop.on("transitionEnd", function(e) {
    $(".js-gallery-trigger").removeClass("is-active");
    $(".js-gallery-trigger")
      .eq(galleryTop.activeIndex)
      .addClass("is-active");
    if ($galleryThumbs[0] && $galleryThumbs[0].swiper)
      $galleryThumbs[0].swiper.slideTo(galleryTop.activeIndex);
  });

  galleryTop.params.control = galleryThumbsSlider;
  galleryThumbsSlider.params.control = galleryTop;

  $galleryThumbs.find(".js-gallery-trigger:first").addClass("is-active");
  $(document).on("click", galleryThumbs + " .js-gallery-trigger", function(
    event
  ) {
    event.preventDefault();
    var index = $(this).index();
    if ($galleryMain[0] && $galleryMain[0].swiper) {
      $galleryMain[0].swiper.slideTo(index);
    }
  });
}

/**
 * PRODUCTS_SLIDER
 */
$(document).ready(function() {
  InitSwiper($(".js-products-slider").not(".products-is-hits"), {
    roundLengths: true,
    autoLength: true, // автоматически выставить кол-во слайдов исходя из минимальной ширины карточки
    minCartWidth: 300, // Минимальная ширина карточки
    autoResponsive: false, // Автоматически расчитать респонсив для слайдера
    freeMode: false,

    breakpoints: {
      1600: {
        slidesPerView: 7
      },
      1200: {
        slidesPerView: 4
      },
      768: {
        slidesPerView: 3
      },
      480: {
        slidesPerView: 2
      }
    }
  });
});

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = ((d + Math.random() * 16) % 16) | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

/**
 * PROMO
 */
$(document).ready(function() {
  if(Site.messages.promo_autoplay == ''){
    var range_autoplay = '100000000';
  } else{
    var range_autoplay = Site.messages.promo_autoplay;
  }

  var sliders = InitSwiper($(".promo-slider"), {
    autoHeight: true,

    autoplay: {
      delay: range_autoplay
    }
  });
});

/**
 * QUICK_VIEW
 */
$(document).ready(function() {
  $(document).on("click", "[data-quick-view]", function(event) {
    event.preventDefault();
    var _id = $(this).data("quick-view");
    Products.get(_id).done(function(product) {
      $(".js-quick_view").html(
        templateLodashRender(convertProperties(product), "quick_view")
      );

      Products.initInstance($(".js-quick_view [data-product-id]"));
      Favorite.checkFavoritesProducts();
      var $galleryThumbs = ".quick_view .js-gallery-thumbs";
      var $galleryMain = ".quick_view .js-product-gallery-main";

      MagicZoom.refresh();

      $.fancybox.open({
        src: "#quick-view", // Source of the content
        type: "inline"
      });

      galleryInit($galleryThumbs, $galleryMain);
    });
  });
});

var convertProperties = function(_product) {
  _product.parameters = {};
  _product.sale = null;

  // Пермалинк параметра: массив характеристик
  $.each(_product.properties, function(index, property) {
    $.each(_product.characteristics, function(index, characteristic) {
      if (property.id === characteristic.property_id) {
        setParam(_product.parameters, property.permalink, property);
        setParam(
          _product.parameters[property.permalink],
          "characteristics",
          []
        );

        var uniq = true;
        $.each(
          _product.parameters[property.permalink].characteristics,
          function(index, cha) {
            if (cha.id == characteristic.id) {
              uniq = false;
            }
          }
        );
        if (uniq) {
          _product.parameters[property.permalink].characteristics.push(
            characteristic
          );
        }
      }
    });
  });

  // Скидка в процентах
  if (_product.variants) {
    $.each(_product.variants, function(index, variant) {
      if (variant.old_price) {
        var _merge = Math.round(
          (parseInt(variant.old_price) - parseInt(variant.price)) /
            parseInt(variant.old_price) *
            100,
          0
        );
        if (_merge < 100) {
          _product.sale = _merge;
        }
      }
    });
  }

  function setParam(obj, name, value) {
    obj[name] || (obj[name] = value);
  }

  return _product;
};

/**
 * RECENTLYVIEW
 */
$(document).ready(function() {
  var $recently_view = $(".js-recently_view");
  if ($recently_view.length > 0) {
    var myRecentlyView = new RecentlyView({
      success: function(_products) {
        if (_.size(_products) > 0) {
          var _templateRecentlyView = _.template(
            $('[data-template-id="recently_view"]').html()
          );
          $recently_view.html(_templateRecentlyView({ products: _products }));

          InitSwiper(".js-recently-slider", {
            autoLength: true,
            minCartWidth: 300,
            //maxBreakpoint: 1920,
            autoResponsive: false
          });

          // Инициализация data-product-id
          Products.getList(_.map(_products, "id"));
        }
      }
    });
  }
});

/**
 * SCRIPTS
 */
$(document).ready(function() {
  $("body").addClass("dom-ready");

  $(window).on("load", function(event) {
    $("body").addClass("window-load");
  });

  var elements = $(".sticky");
  Stickyfill.add(elements);
});

/**
 * SCROLL_TOP
 */
$(document).ready(function() {
  var scroll_top = new DetectiveScroll({
    trigger: {
      el: $(".js-scroll_top"),
      scroll: $(window).height() / 3
    }
  });

  $(document).on("click", ".js-scroll_top", function(event) {
    event.preventDefault();
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  });
});

/**
 * HELP
 */
function deleteAllCookies() {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var spcook = cookies[i].split("=");
    deleteCookie(spcook[0]);
  }
  function deleteCookie(cookiename) {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var expires = ";expires=" + d;
    var name = cookiename;
    //alert(name);
    var value = "";
    document.cookie = name + "=" + value + expires + "; path=/acc/html";
  }
  window.location = ""; // TO REFRESH THE PAGE
}

$(document).ready(function() {
  $(document).on("click", "[data-clear-cookies]", function(event) {
    event.preventDefault();
    deleteAllCookies();

    alertify.success("Куки очищены", 4);
  });
  $(document).on("click", "[data-clear-localforage]", function(event) {
    event.preventDefault();
    localforage.clear();

    alertify.success("localforage очищен", 4);
    window.location = ""; // TO REFRESH THE PAGE
  });
  $(document).on("click", "[data-clear-cart]", function(event) {
    event.preventDefault();
    Cart.clear();

    setTimeout(function() {
      alertify.success("Корзина очищена", 4);
      window.location = ""; // TO REFRESH THE PAGE
    }, 3000);
  });
});

/**
 * STYLE_GUIDE
 */
$(document).ready(function() {
  $(".js-style_tabs").dataTabs({
    state: "accordion"
  });
  $("[data-alert-success]").click(function(event) {
    alertify.success("Товар добавлен в корзину", 10);
  });
  $("[data-alert-error]").click(function(event) {
    alertify.error("Ошибка при отправке формы", 10);
  });
  $("[data-alert-warning]").click(function(event) {
    alertify.warning("Товар удален", 10);
  });
  $("[data-alert-message]").click(function(event) {
    alertify.message("Все поля обязательны для заполнения", 10);
  });

  $(".js-fav-style").click(function(event) {
    event.preventDefault();

    $(this).toggleClass("not-added is-added");
  });
});

/**
 * TEMPLATE
 */
/**
 * Получение шаблона Lodash на основе данных
 * @param  {all} content       Данные для шаблона
 * @param  {string} templateId id из аттрибута data-template-id
 * @return {html}
 */
function templateLodashRender(content, templateId) {
  var templateContent = $('[data-template-id="' + templateId + '"]').html();
  var renderContent = _.template(templateContent);

  return renderContent(content);
}


function getStiker(name, characteristics) {
  var labels_list = "";
  _.forEach(characteristics, function(characteristic) {
    if (
      characteristic.permalink == name ||
      (characteristic.property
        ? characteristic.property.permalink == name
        : false)
    ) {
      labels_list += '<div class="stiker stiker-';
      labels_list += characteristic.permalink;
      labels_list += '"><span>';
      labels_list += characteristic.title;
      labels_list += "</span></div>";
    }
  });

  return labels_list;
}

$(document).ready(function(){
  var indexReviews = InitSwiper($(".js-index-reviews"), {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoHeight: true
  });

  $('[data-show-img]').each(function(){
    var dataUrl = $(this).attr('data-show-img');
    var dataTitle = $(this).attr('data-prod-title');

    $(this).append('<img class="transition hide-sm" src="' + dataUrl + '" alt="' + dataTitle + '" />');
  });

  $('[data-checkbox-change] input[type="checkbox"]').on('change', function(){
    var form = $(this).parents('form:first');
    var inpGroup = $(this).parents('.filter-item:first');

    var f = form.offset().top;
    var i = inpGroup.offset().top;
    var r = i - f;

    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: form.attr('action') + '.json',
      data: form.serialize(),
      success: function(data){
        $('[data-show-result]').html(data.count);
        $('[data-show-products]').css({
          'display' : 'block',
          'top' : r + 'px'
        });
      }

    });
  });

});

function dynamicBasket(){
  function basketPreloadStart(){ $('.cart-popup').addClass('preload'); }
  function basketPreloadEnd(){ $('.cart-popup').removeClass('preload'); }

  $('.js-basket').on('click', function(e){
    e.preventDefault();
  });

  EventBus.subscribe("update_items:insales:cart", function(cart) {
    $(".dynamic_basket").html(templateLodashRender(cart, 'dynamic_basket'));
    InSalesUI.initAjaxInstance($(".js-dynamic_basket"));
    $.ajax('/front_api/cart.json')
      .done(updateDiscount);
  });

  function doneCoupon(){
    var coup = $('[data-item-coupon]').val();
    if(coup == ''){
      var coup = ' ';
    }

    Cart.setCoupon({
      coupon: coup
    });
  }

  $(document).on('keydown', '[data-item-coupon]', function(){
    $(document).find('[data-coupon-submit]').css('display', 'inline-block');
  });

  $(document).on('click', '[data-coupon-submit]', function(e){
    e.preventDefault();

    doneCoupon();
    $(this).css('display', 'none');
  });

}

function customPopup(){
  function openCustomPopup(customEvent){
    $(document).find('[custom-popup-modal="' + customEvent + '"]').addClass('opened');
    $(document).find('[custom-popup-link="' + customEvent + '"]').addClass('active');
    $(document).find('[custom-popup-bg="' + customEvent + '"]').addClass('active');
  }
  function closeCustomPopup(customEvent){
    $(document).find('[custom-popup-modal="' + customEvent + '"]').removeClass('opened');
    $(document).find('[custom-popup-link="' + customEvent + '"]').removeClass('active');
    $(document).find('[custom-popup-bg="' + customEvent + '"]').removeClass('active');
  }

  $(document).on('click', '[custom-popup-link]', function(e){
    e.preventDefault();
    var thisEl = $(this);
    var customEvent = thisEl.attr('custom-popup-link');

    if(thisEl.hasClass('active')){
      closeCustomPopup(customEvent);
    } else{
      openCustomPopup(customEvent);
    }
  });

  $(document).on('click', '[custom-popup-close]', function(e){
    e.preventDefault();
    var thisEl = $(this);
    var customEvent = thisEl.attr('custom-popup-close');

    closeCustomPopup(customEvent);
  });

  $(document).on('click', '[custom-popup-bg]', function(e){
    e.preventDefault();
    var thisEl = $(this);
    var customEvent = thisEl.attr('custom-popup-bg');

    closeCustomPopup(customEvent);
  });
}

function collectionCount(){
  $('[name="page_size"]').each(function(){
    var thisEl = $(this);

    if(window.location.search != ''){
      var search = window.location.search;
      var res = 'page_size='
      var result = search.match(res);

      if(!result){
        thisEl.val($('.js-show-page-size').html());
      }
    } else{
      thisEl.val($('.js-show-page-size').html());
    }
  });
}

function flattenMenu(){
  $('.js-flatten-open').on('click', function(){
    var thisEl = $(this).parents('li:first');

    if(thisEl.hasClass('active')){
      thisEl.next('ul:first').css('display', 'none');
      thisEl.removeClass('active');
    } else{
      thisEl.next('ul:first').css('display', 'block');
      thisEl.addClass('active');
    }
  });
}

function customAccordeon(){
  $('.js-accordeon').on('click', function(e){
    e.preventDefault();

    var thisEl = $(this);
    var dataHref = thisEl.attr('href');
    $('[data-href="' + dataHref + '"]').toggleClass('hide');
  });
}

function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

$(document).ready(function(){
  dynamicBasket();
  customPopup();
  collectionCount();
  flattenMenu();
  customAccordeon();
});


