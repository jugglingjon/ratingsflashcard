$.fn.onTap = function(handler){
	var timeout,
	longtouch;

	this.bind('touchstart', function() {
		timeout = setTimeout(function() {
			longtouch = true;
		}, 130);
	}).bind('touchend', function() {
		if (!longtouch) {
			// It was a long touch.
			handler();
		}
		longtouch = false;
		clearTimeout(timeout);
	});
	return this;
}

$(document).ready(function(){

	function launchFullscreen(element) {
		if(element.requestFullscreen) {
			element.requestFullscreen();
		} else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if(element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}

	function exitFullscreen() {		
		if(document.exitFullscreen) {
		    document.exitFullscreen();
		  } else if(document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		  } else if(document.webkitExitFullscreen) {
		    document.webkitExitFullscreen();
		  }
	}

	$('body').on('click','#fullscreen:not(.isFullScreen)',function(){
		launchFullscreen(document.documentElement);
		$(this).addClass('isFullScreen');
	});

	$('body').on('click','#fullscreen.isFullScreen',function(){
		exitFullscreen();
		$(this).removeClass('isFullScreen');
	});


	//show info modal to begin
	$('#infoModal').modal('show');

	var currentCard,
		deck,
		history=[],
		restrictTo='all';

	//if local saved version available, load that deck
	if(localStorage.navyCards){
		sortedCards=$.parseJSON(localStorage.navyCards);
	}

	//populate array of card types
	var types=[];
	$.each(sortedCards.hard,function(){
		if(types.indexOf(this.type)==-1){
			types.push(this.type);
			
		}
	});
	types.sort();

	$.each(types,function(){
		var newOption=$('<option value="'+this+'">'+this+'</option>');
		$('#typeSelect').append(newOption);
	});

	$('#typeSelect').change(function(){
		restrictTo=$(this).val();
		console.log(restrictTo,$(this).val());
		toNext();
	})

	//return random integer
	function randomIndex(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	//choose random easy or tough card 80/20 split
	function randomCard(){

		var returnCard;
		console.log(restrictTo);
		if(restrictTo=='all'){
			if(sortedCards.easy.length&&sortedCards.hard.length){
				if (Math.random()<=.2){
					deck='easy';
					currentCard=randomIndex(0,sortedCards.easy.length-1);
					returnCard= sortedCards.easy[currentCard];
				}
				else{
					deck='hard';
					currentCard=randomIndex(0,sortedCards.hard.length-1);
					returnCard= sortedCards.hard[currentCard];
				}
			}
			else if(sortedCards.easy.length){
				deck='easy';
				currentCard=randomIndex(0,sortedCards.easy.length-1);
				returnCard= sortedCards.easy[currentCard];
			}
			else{
				deck='hard';
				currentCard=randomIndex(0,sortedCards.hard.length-1);
				returnCard= sortedCards.hard[currentCard];
			}

			history.push({"deck":deck,"currentCard":currentCard});
			return returnCard;
		}
		else{
			do{
				if(sortedCards.easy.length&&sortedCards.hard.length){
					if (Math.random()<=.2){
						deck='easy';
						currentCard=randomIndex(0,sortedCards.easy.length-1);
						returnCard= sortedCards.easy[currentCard];
					}
					else{
						deck='hard';
						currentCard=randomIndex(0,sortedCards.hard.length-1);
						returnCard= sortedCards.hard[currentCard];
					}
				}
				else if(sortedCards.easy.length){
					deck='easy';
					currentCard=randomIndex(0,sortedCards.easy.length-1);
					returnCard= sortedCards.easy[currentCard];
				}
				else{
					deck='hard';
					currentCard=randomIndex(0,sortedCards.hard.length-1);
					returnCard= sortedCards.hard[currentCard];
				}
			}
			while(returnCard.type!=restrictTo);

			history.push({"deck":deck,"currentCard":currentCard});
			return returnCard;
		}
		
	}


	//change between cards
	function changeCard(animationDirection,card){
		var newCard='<div class="flipper animated cardIn'+animationDirection+' fullscreen-img" style="display:none">'+
			//'<div class="front" style="background-image:url(\'card-images/'+escape(card.image)+'\');">'+
			'<div class="front">'+
				'<div class="front-clip">'+
				'	<img src="card-images/'+escape(card.image)+'\">'+
					'<div class="question-box">'+
						card.question+
					'</div>'+
				'</div>'+
			'</div>'+

			'<div class="back" style="background-image:url(\'card-images/'+escape(card.image)+'\');">'+
				'<p class="back-question">'+card.question+'</p>'+
				'<p>'+card.answer+'</p>'+
				'<p>'+card.fun+'</p>'+
			'</div>'+
		'</div>';
		$('.flip-container').removeClass('hover');
		$(newCard).appendTo('.flip-container').show().one('animationend webkitAnimationEnd',function(){
			$(this).removeClass('animated cardIn'+animationDirection);
		});
	}

	//evaluate difficulty button state
	function evalButtons(){

		//mark card's difficulty
		if(sortedCards[deck][currentCard].difficulty){
			$('#btn-'+sortedCards[deck][currentCard].difficulty).addClass('difficulty-marked').siblings().removeClass('difficulty-marked');
		}
		else{
			$('#btn-hard,#btn-easy').removeClass('difficulty-marked');
		}

		if(history.length>1){
			$('#prev-btn').fadeIn();
		}
		else{
			$('#prev-btn').fadeOut();
		}
	}

	
	//to next/prev handlers
	function toPrev(){
		$('.flipper').addClass('animated cardOutRight').one('animationend webkitAnimationEnd',function(){$(this).remove();});
		var lastIndex=history.length-2;
		var lastCard=history[lastIndex];

		changeCard('Right',sortedCards[lastCard.deck][lastCard.currentCard]);
		currentCard=lastCard.currentCard;
		deck=lastCard.deck;

		history.splice(history.length-1,1);
		evalButtons();
	}

	function toNext(){
		$('.flipper').addClass('animated cardOutLeft').one('animationend webkitAnimationEnd',function(){$(this).remove();});
		changeCard('Left',randomCard());
		evalButtons();
	}

	//next button routines
	$('#next-btn').click(function(){
		toNext();
		return false;
	});

	//previous button routines
	$('#prev-btn').click(function(){
		toPrev();
		return false;
	});

	//detect swiping
	$('#flip-container').swipe( {
        swipeLeft:function() {
        	toNext();
        },
        swipeRight:function() {
        	if(history.length>1){
				toPrev();
			}

        }
    });


	$('#flip-container').click(function(){
		$('#flip-container').toggleClass('hover');
	});

	//easy/tough marking
    $('#btn-hard:not(.difficulty-marked)').click(function(){
    	sortedCards[deck][currentCard].difficulty='hard';
    	sortedCards['hard'].push(sortedCards[deck][currentCard]);
    	sortedCards[deck].splice(currentCard,1);
    	deck='hard';
    	currentCard=sortedCards[deck].length-1;
    	history[history.length-1].deck=deck;
    	history[history.length-1].currentCard=currentCard;

    	localStorage.setItem("navyCards", JSON.stringify(sortedCards));
    	$(this).addClass('difficulty-marked').siblings().removeClass('difficulty-marked');
    	
    	return false;
    });

    $('#btn-easy:not(.difficulty-marked)').click(function(){
    	sortedCards[deck][currentCard].difficulty='easy';
    	sortedCards['easy'].push(sortedCards[deck][currentCard]);
    	sortedCards[deck].splice(currentCard,1);
    	deck='easy';
    	currentCard=sortedCards[deck].length-1;
    	history[history.length-1].deck=deck;
    	history[history.length-1].currentCard=currentCard;

    	localStorage.setItem("navyCards", JSON.stringify(sortedCards));
    	$(this).addClass('difficulty-marked').siblings().removeClass('difficulty-marked');

    	return false;
    });


	//initialize first card
	changeCard('Left',randomCard());
	evalButtons();

	//pull up and populate stats screen
	$('#statBtn').click(function(){
		var unmarked=0,
			easy=0,
			hard=0,
			combinedDeck=[];
		
		combinedDeck=sortedCards.hard.concat(sortedCards.easy);


		$.each(combinedDeck,function(){
			if(this.difficulty){
				if(this.difficulty=='hard')
					hard++;
				else
					easy++;
			}
		});
		unmarked=combinedDeck.length-(easy+hard);

		$('#stat-new').text(unmarked);
		$('#stat-easy').text(easy);
		$('#stat-hard').text(hard);
	});

	//reset stats
	function resetStats(){
		
		$.merge(sortedCards.hard,sortedCards.easy);
		sortedCards.easy.splice(0,sortedCards.easy.length);
		$.each(sortedCards.hard,function(){
			this.difficulty='';
		});
		localStorage.setItem("navyCards", JSON.stringify(sortedCards));

		toNext();
	}

	//reset stats button
	$('#btnReset').click(function(){
		resetStats();
	});
});