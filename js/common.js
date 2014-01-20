jQuery.fn.tipsy = function(){};
jQuery.fn.facebox = function(){};

$(function(){
	// 初始化ui-select
	$('.ui-select').each(function(){
		var ui = $(this), slt = ui.find('select');
		var opt = slt.find('option:selected').length > 0 ? slt.find('option:selected') : slt.find('option:first');
		ui.find('span').text(opt.text());
		slt.on('change', function(){
			ui.find('span').text(slt.find('option:selected').text());
		});
	});

	$('#gourpMobilePage').each(loadGroup);

	// 页面跳转前，页面回到顶部，防止后退回到页面时，保留有先前的滚动位置
	$(window).on('beforeunload', function(){
		// $('body').css('opacity', 0);
		$(document).scrollTop(0);
	});

});

// 上传头像组件
var base, cur, scale, pic_w, pic_h;
function initCrop(img) {
	var $img = $(img),
		container = $img.closest('.reg-crop-cont'),
		pic = container.find('.reg-crop-pic');
	pic_w = pic.outerWidth();
	pic_h = pic.outerHeight();
	base = {
		width: img.width,
		height: img.height,
		left: 0,
		top: 0
	};
	cur = $.extend({}, base);
	scale = 1;

	function initWH(){
		if( pic_w > base.width || pic_h > base.height ){
			checkSmall();
		}
		$img.width(cur.width).height(cur.height);
		cur.left = ( cur.width > pic_w ) ? (cur.width - pic_w) / 2 : 0;
		cur.top = ( cur.height > pic_h ) ? (cur.height - pic_h) / 2 : 0;
		setLT();
	}

	function checkSmall(){
		scale = Math.max(pic_w / base.width, pic_h / base.height);
		cur.width = Math.max(pic_w, Math.round(base.width * scale));
		cur.height = Math.max(pic_h, Math.round(base.height * scale));
	}

	function setWH(){
		var old = {
			width: $img.width(),
			height: $img.height()
		}
		$img.width(cur.width).height(cur.height);
		cur.left = Math.min(cur.width - pic_w, Math.max(0, (cur.left - old.width / 2) + cur.width / 2));
		cur.top = Math.min(cur.height - pic_h, Math.max(0, (cur.top - old.height / 2) + cur.height / 2));
		setLT();
	}
	function setLT(){
		$img.css('left', - Math.floor(cur.left));
		$img.css('top', - Math.floor(cur.top));
		$img.data('xyz', {
			z: scale,
			x: Math.round(cur.left / scale),
			y: Math.round(cur.top / scale),
			w: base.width,
			h: base.height
		});
	}

	container.find('.reg-crop-zoom-s').on('touchend', function(){
		if( cur.width * 0.9 < pic_w || cur.height * 0.9 < pic_h ){
			checkSmall();
		} else {
			cur.width = Math.max(pic_w, Math.round(cur.width * 0.9));
			cur.height = Math.max(pic_h, Math.round(cur.height * 0.9));
			scale = cur.width / base.width;
		}
		setWH();
	});
	container.find('.reg-crop-zoom-l').on('touchend', function(){
		if( cur.width >= base.width || cur.height >= base.height ) return;
		if( cur.width * 1.1 > base.width || cur.height * 1.1 > base.height ){
			scale = 1;
			cur.width = base.width;
			cur.height = base.height;
		} else {
			cur.width = Math.round(cur.width * 1.1);
			cur.height = Math.round(cur.height * 1.1);
			scale = cur.width / base.width;
		}
		setWH();
	});
	container.find('.reg-crop-top').on('touchend', function(){
		cur.top = ( (cur.top + (cur.height * 0.05) + pic_h) >= cur.height ) ? cur.height - pic_h : cur.top + (cur.height * 0.05);
		setLT();
	});
	container.find('.reg-crop-bottom').on('touchend', function(){
		cur.top = ( cur.top < cur.height * 0.05 ) ? 0 : cur.top - (cur.height * 0.05);
		setLT();
	});
	container.find('.reg-crop-left').on('touchend', function(){
		cur.left = ( (cur.left + (cur.width * 0.05) + pic_w) >= cur.width ) ? cur.width - pic_w : cur.left + (cur.width * 0.05);
		setLT();
	});
	container.find('.reg-crop-right').on('touchend', function(){
		cur.left = ( cur.left < cur.width * 0.05 ) ? 0 : cur.left - (cur.width * 0.05);
		setLT();
	});

	initWH();
}

function initWaterfall(pages, url){
	var isLoading = false;
	if( $.isFunction(url) ){
		var getUrl = url;
	} else {
		url = url || '';
		var getUrl = function(page){
			return url + page;
		}
	}
	pages = parseInt(pages || '50', 10) || 50;

	$('.wf-list-getmore').on('click', function(){
		var page = parseInt($(this).attr('page') || 2);
		try {
			if( page <= pages ) loadList(page);
		} catch(e){}
	});

	function scrollAction(){
		var wh = $(window).height();
		var s = $(document).scrollTop() + wh;
		var m = $('.wf-list').outerHeight() - (wh / 2);
		if( s > m && isLoading == false ){
			$('.wf-list-getmore').trigger('click');
		}
	}

	function loadList(page){
		$(document).off('scroll.wfGetMore');
		isLoading = true;
		$('.wf-list-getmore').text('Loading ...');
		$.get(getUrl(page), function(data){
			if( $.trim(data) == '' ){
				$('.wf-list-getmore').hide();
				return false;
			}
			data = $(data).filter('div.wf-block');
			if( data.length == 0 ){
				$('.wf-list-getmore').hide();
				return false;
			}
			data.each(bindLoaded);
			page = page + 1;
			$('.wf-list-getmore').attr('page', page);
			$('#wfList').append(data);
			setTimeout(insertBlock, 0);

			if( page > pages ){
				$('.wf-list-getmore').hide();
			}
		});
	}

	function insertBlock(first){
		var block = $('#wfList > div[loaded=true]:first');
		if( block.length > 0 ){
			var right = $('.wf-list-right'), mid = $('.wf-list-middle'), left = $('.wf-list-left');
			var side = left.height() > mid.height() ? mid : left;
			side = side.height() > right.height() ? right : side;
			side.append(block);
			if( block.find('.wf-vote').length > 0 ){
				var vote = block.find('.wf-vote');
				var vc = 0;
				vote.find('[data-field="voteCnt"]').each(function(){
					vc += parseInt($(this).text(), 10);
				});
				if( vc > 0 ){
					vote.find('.wf-vote-item').each(function(){
						var item = $(this), c = parseInt(item.find('[data-field="voteCnt"]').text(), 10);
						if( c > 0 ){
							item.find('.wf-vote-inbar').css('width', c / vc * 100 + '%');
						}
					});
				}
			}
		}
		if( $('#wfList > div').length > 0 ){
			setTimeout(insertBlock, 50);
		} else {
			isLoading = false;
			if( first != true ){
				$(document).on('scroll.wfGetMore', scrollAction);
				$('.wf-list-getmore').text('Get more');
			} else {
				$('.wf-list-getmore').hide();
			}
		}
	}

	function bindLoaded(){
		$('.wf-img-cont img', this).on('load', function(){
			$(this).closest('.wf-block').attr('loaded', 'true');
		});
		var block = $(this);
		setTimeout(function(){
			block.attr('loaded', 'true');
		}, 3000);
	}

	$('.wf-list-getmore').text('Loading ...');
	$('#wfList > div').each(bindLoaded);
	setTimeout(function(){
		insertBlock(true);
	}, 200);

	if( pages <= 1 ){
		$('.wf-list-getmore').hide();
	}
}

function loadGroup(){
	var page = $(this), url = page.attr('pageUrl'), locale = page.attr('locale');
	$.post(url, {request_locale: locale}, function(html){
		page.append(html);
		var wfList = $('#wfList');
		if( wfList.length > 0 ){
			initWaterfall(99, wfList.attr('url'));			
		}
	});
}
