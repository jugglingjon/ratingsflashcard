//create ranks array
var ranks;
var ranksBackup;

//create history of quesitons array
var rankHistory=[];

//create score and reset
var score=0;
var scoreMultiplier=1;

//timing variables
var time = 0,
maxTime = 1600,
timer;

//difficulty setting
var difficulty;
var maxDifficulty;



//retrieves diffculty settings
function restoreDifficulty(){

	//if difficulty exists in local storage, use that, otherwise start easy
	if(localStorage.difficulty){
		setDifficulty(localStorage.difficulty,localStorage.maxDifficulty);
	}
	else{
		setDifficulty(1,1);
	}
}

//sets difficulty setting
function setDifficulty(dif, dmax){

	//difficulty subset array
	var difficultySubset=[];

	//set global difficulty and max available difficulty, store in localstorage
	difficulty=dif;
	maxDifficulty=dmax;
	localStorage.difficulty=dif;
	localStorage.maxDifficulty=dmax;

	//set difficulty button states (active and disabled)
	$('.btn-difficulty').removeClass('setDifficulty disabledDifficulty');
	$('.btn-difficulty[data-set-difficulty="'+difficulty+'"]').addClass('setDifficulty');
	$('.btn-difficulty[data-set-difficulty="'+maxDifficulty+'"]').nextAll().addClass('disabledDifficulty');


	var optionPadding=(3-difficulty)*100;
	$('.question .question-box .box-content .options').css('padding-left',optionPadding+'px');

	//define subset of ranks and score multiplier based on difficulty setting
	scoreMultiplier=dif;

}

//case insensitive 'contains' selector
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

//return current date
function getDate(){
	var d = new Date();

	var month = d.getMonth()+1;
	var day = d.getDate();
	var year = d.getFullYear();
	return {"day":day,"month":month,"year":year};
}


//shuffle arrays
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function copyArray(targetArray){
	var clonedArray = JSON.parse(JSON.stringify(targetArray));
	return clonedArray;
}

function commaScore(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }


$(document).ready(function(){

	//add scrolled class when page scrolls
	$(window).scroll(function(){
		if($(window).scrollTop()>20){
			$('body').addClass('scrolled');
		}
		else{
			$('body').removeClass('scrolled');
		}
	});


	//hide scoreboard if empty
	if(!localStorage.ratingScores){
		$('[data-to=scoreboard]').hide();
	}

	//initialize timer
	$('#dial').knob({
		readOnly : true,
		thickness : 1,
		max : maxTime,
		width: 30,
		height: 30,
		bgColor: '#1C1C1C',
		fgColor: '#FFD081'
	});
	$('#dial').parent().hide();

	//load ranks from json file, populate reference field
	$.getJSON('js/ratings.json',function(data){

		

		//update ranks variable
		ranks=data;
		ranksBackup=ranks;

		//restore difficulty
		restoreDifficulty();

		//populate ranks field
		$.each(ranksBackup,function(index){
			this.id=index;

			var imgURL;
			imgURL=this.branch+'/'+this.abbreviation;

			var newRank=$('<a href="#" class="reference-rank branch-'+this.branch+' type-'+this.type+'" data-id="'+this.id+'">'+
				'<img src="img/'+imgURL+'.png" class="img-responsive">'+
				'<span class="reference-rank-meta reference-rank-meta-branch" data-branch-label="'+this.branch+'">'+this.branch+'</span>'+
				'<div class="reference-rank-title">'+
					this.title+
				'</div>'+
			'</a>').appendTo('.reference-field');
		});

		//click action to open modal
		$('.reference-rank').click(function(){
			rank=ranksBackup[$(this).attr('data-id')];

			$('.reference-detail-title').text(rank.title);
			$('.reference-detail-branch').text(rank.branch);
			$('.reference-detail-description').text(rank.description);

			//emtpy image field in refernce detail modal
			$('.reference-detail-images').empty();
			
			var newInsignia=$('<div><img src="img/'+rank.branch+'/'+rank.abbreviation+'.png" class="img-responsive"></div>');
			newInsignia.appendTo('.reference-detail-images');
	

			//open modal
			$('#reference-detail').modal();
			return false;
		});
		
	});

	//load ranks from json file, populate reference field
	
	
	//change isotope field basedon filter settings
	function updateFilter(){
		$('.loader').animateIn('fadeIn');
		var textbox=$('input[type=text]');

		//isotope filtering
		$('.reference-field').isotope({
			filter:function(){
				var allTrue=true;
				//if ratings mode, only consider text search

				if(!$(this).hasClass('type-'+$('#filter-type').val())){
					allTrue=false;
				}

				if(!$(this).find('.reference-rank-title:contains("'+textbox.val()+'")').length){
					allTrue=false;
				}

				return allTrue;
			}
		});
		$('.reference-field').one( 'arrangeComplete', function() {
			$('.loader').animateOut('fadeOut');
		});
	}

	$('select').change(function(){
		updateFilter();
	});


	$('input[type=text]').keyup(function(){
		updateFilter();
	});


	//returns random rank
	function getRandomRank(possibleDistractors){

		var set=ranks;
		if(possibleDistractors){
			set=possibleDistractors;
		}

		var randomIndex=-1;
		randomIndex=chance.integer({min:0, max:set.length-1});


		return set[randomIndex];
	}



	//returns random rank not in rank history
	function getUniqueRank(){
		var addedrank;
		var insignia;
		var originalHistoryLength=rankHistory.length;

		//repeat until unique rank found
		do{
			addedrank=getRandomRank();

			var possibleDistractors = ranks;

			if(rankHistory.indexOf(addedrank.id)===-1&&possibleDistractors.length>=4){
				rankHistory.push(addedrank.id);
				console.log(copyArray(addedrank));
				return copyArray(addedrank);
			}
		}
		while(originalHistoryLength==rankHistory.length);
	}


	
	//returns unique set of distractors, not including question rank
	function getDistrators(questionRank){
		var distractors=[];
		var distractor;
		
		var possibleDistractors = ranks;
		
		//repeat until 3 unique distractors found
		do{
			distractor=getRandomRank(possibleDistractors);
			
			if(distractors.indexOf(distractor)===-1&&distractor.id!=questionRank.id){
				distractors.push(distractor);

				if(distractors.length==difficulty){
					return distractors;
				}
			}
		}
		while(distractors.length<difficulty);
	}

	//updates progress indicator area for quiz
	function updateProgress(){
		var currentIndex=rankHistory.length;
		var current=currentIndex+1;

		$('.progress-current').text(current);

		$('.progress-dots span:lt('+current+')').addClass('active');
	}

	//loads question and options
	function loadQuestion(){

		//update progress indicator
		updateProgress();
		
		//clear options
		$('.options a').remove();

		//get random unique rank, that hasn't been previously shown
		var questionRank=getUniqueRank();
		//console.log(questionRank);
		
		//mark rank as correct
		questionRank.correct=true;
		$('.question-rank-branch').text(questionRank.branch);
		$('.question-rank-title').text(questionRank.title);
		$('.question-text').css('opacity','1');
		
		//load response images into response modal
		$('.response-images').empty();
	
		var newInsignia=$('<div><img src="img/'+questionRank.branch+'/'+questionRank.abbreviation+'.png" class="img-responsive"></div>');
		newInsignia.appendTo('.response-images');


		//get unique distractors
		var distractors=getDistrators(questionRank);
		var correct=[questionRank];

		//merge distractors and correct together
		$.merge(distractors,correct);

		
		//shuffle options
		var options=shuffle(distractors);

		//mark option as correct, add shuffled options to screen
		$.each(options,function(){
			var correctString='';

			if (this.correct){
				correctString='data-correct="true"';
			}
			var newOption=$('<a href="#" '+correctString+' style="display:none;"><img src="img/'+this.branch+'/'+this.abbreviation+'.png" alt="" class="img-responsive"></a>');
			newOption.appendTo('.options');
		});

		//click actions for options
		$('.options a').click(function(){
			
			//set correct/incorrect response text
			var responseText='<span class="text-incorrect">Incorrect</span>';

			if ($(this).attr('data-correct')=='true'){
				responseText='<span class="text-correct">Correct</span>';

				//calculate points including time bonus
				var correctPoints=500*scoreMultiplier;
				var timeBonus=Math.floor(((1600-time)/1600)*(100*scoreMultiplier));
				var additional=correctPoints+timeBonus;
				
				//add points to score
				score+=additional;

				//update score tracker
				$('.score-current').text(commaScore(score));
				$('.score-new').text('+'+commaScore(additional)).fadeIn();
			}
			else{
				$('.score-new').fadeOut();
			}

			//update and show response modal
			$('.responseText').html(responseText);
			$('#response').modal({
				backdrop: 'static'
			});

			//fade out timer dial
			$('#dial').parent().fadeOut(function(){
				time=0;
				$('#dial').trigger('change');
			});
		});

		

		//animate in options
		$('.options a').cascadeIn('fadeInDown',function(){
			
			//fade in dial and reset
			$('#dial').parent().fadeIn();
			window.clearInterval(timer);
			time=0;

			//timing interval
			timer=setInterval(function() {
				
				//if time runs out, stop timer
				if(time==maxTime) {
					clearInterval(timer);
				}
				else{
					time+=1;
				}

				//update timer wheel
				$('#dial')
					.val(time)
					.trigger('change');
			}, 1);
		});

	}

	//screen destinations from home
	$('.intro .intro-box .box-content a').click(function(){
		var toTarget=$(this).attr('data-to');
		$('.intro').animateOut('fadeOut',function(){
			$('.nav-'+toTarget).animateIn('fadeInDown');
			$('.'+toTarget).animateIn('fadeInDown',function(){
				if(toTarget=='question'){
					score=0;
					rankHistory=[];
					loadQuestion();		
					$('.progress-dots span:gt(0)').removeClass('active');	
					$('.progress-current').text('1');		
				}
				else if(toTarget=='reference'){
					$('.reference-field').isotope();
				}
			});
		});
		return false;
	});

	//build scoreboard
	$('[data-to=scoreboard]').click(function(){
		//copy of scores local storage
		var scores=JSON.parse(localStorage.ratingScores);

		//comparison sort function for top scores list
		function compare(a,b) {
			if (a.score < b.score)
				return 1;
			if (a.score > b.score)
				return -1;
			return 0;
		}

		//sort score array
		scores.sort(compare);

		//get highest score and populate meta data
		var highscore=scores[0];
		$('#scoreboard-high').text(commaScore(highscore.score));
		$('#scoreboard-high-date').text(highscore.month+'/'+highscore.day+'/'+highscore.year);
		
		//clear and build top score table
		$('#scoreboard-table').empty();
		$.each(scores,function(index){
			var newRow=$('<tr>'+
			'<th>'+(index+1)+'</th>'+
			'<td>'+commaScore(this.score)+'</td></tr>');
			if(index<4) newRow.appendTo('#scoreboard-table');
		});
	});

	//load new set on continue
	$('#response .btn-continue').click(function(){
		$('.question-text').css('opacity','0');
		$($('.options a').get().reverse()).cascadeOut('fadeOutDown',function(){
			//if game incomplete, ask another question
			if(rankHistory.length<10){
				loadQuestion();
			}
			else{
				//if game complete, animate out question, and nav
				$('.nav-question').animateOut('fadeOutUp');

				$('.question').animateOut('fadeOutDown',function(){
					//store score along with date in scoreboard local storage

					$('.final-score').text(commaScore(score));
					var date=getDate();
					var scoreObj={
						"score":score,
						"day":date.day,
						"month":date.month,
						"year":date.year
					}
					
					//if score merits unlocking new max difficulty, unlock and store new max
					var newMaxDifficulty=1;
					if (score>=5000){
						newMaxDifficulty=2;
					}
					if(score>=9000){
						newMaxDifficulty=3;
					}

					if (newMaxDifficulty>parseInt(maxDifficulty)){
						maxDifficulty=newMaxDifficulty;
						localStorage.maxDifficulty=maxDifficulty;
					}
					restoreDifficulty();

					//add to existing localstorage scorebard, or create if empty
					if(localStorage.ratingScores){
						var existingScores=localStorage.ratingScores;
						existingScores=JSON.parse(existingScores);
						existingScores.push(scoreObj);
						existingScores=JSON.stringify(existingScores);
						localStorage.ratingScores=existingScores;
					}
					else{
						scoreObj=JSON.stringify([scoreObj]);
						localStorage.ratingScores=scoreObj;
					}

					//show scoreboard link, if hidden because previously empty
					$('[data-to=scoreboard]').show();

					//reset score, rankhistory, score display, new points alert
					score=0;
					rankHistory=[];
					$('.score-current').text('0');
					$('.score-new').fadeOut();

					//show completion screen
					$('#complete').modal();
				});
			}
		});
	});

	//difficulty buttons
	$('.btn-difficulty:not(.disabledDifficulty)').click(function(){
		
		//set button highlight
		$('.btn-difficulty').removeClass('setDifficulty');
		$(this).addClass('setDifficulty');

		//pull difficulty level from button
		var difficultyLevel=$(this).attr('data-set-difficulty');
		setDifficulty(difficultyLevel,maxDifficulty);

		return false;
	});


	//to intro from question
	$('#back-question').click(function(){
		$('.nav-question').animateOut('fadeOutUp');

		$('.question').animateOut('fadeOutUp',function(){
			$('.intro').animateIn('fadeIn');
			$('.options a').hide();
		});
	});

	//to intro from scoreboard
	$('#back-scoreboard').click(function(){
		$('.nav-scoreboard').animateOut('fadeOutUp');

		$('.scoreboard').animateOut('fadeOutUp',function(){
			$('.intro').animateIn('fadeIn');
		});
	});

	//to intro from settings
	$('#back-settings').click(function(){
		$('.nav-settings').animateOut('fadeOutUp');

		$('.settings').animateOut('fadeOutUp',function(){
			$('.intro').animateIn('fadeIn');
		});
	});

	//to intro from complete
	$('#back-complete').click(function(){
		$('.intro').animateIn('fadeIn');
	});

	//to intro from reference
	$('#back-reference').click(function(){
		$('.nav-reference').animateOut('fadeOutUp');

		$('.reference').animateOut('fadeOut',function(){
			$('.intro').animateIn('fadeIn');
			$('.options a').hide();
		});
	});

	$('.switch input').change(function(){
		if($(this).is(':checked')){
			$(this).siblings('label').text('Ratings');
		}
		else{
			$(this).siblings('label').text('Ranks');
		}
	});

});

