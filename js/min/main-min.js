function restoreDifficulty(){localStorage.difficulty?setDifficulty(localStorage.difficulty,localStorage.maxDifficulty):setDifficulty(1,1)}function setDifficulty(e,t){var a=[];difficulty=e,maxDifficulty=t,localStorage.difficulty=e,localStorage.maxDifficulty=t,$(".btn-difficulty").removeClass("setDifficulty disabledDifficulty"),$('.btn-difficulty[data-set-difficulty="'+difficulty+'"]').addClass("setDifficulty"),$('.btn-difficulty[data-set-difficulty="'+maxDifficulty+'"]').nextAll().addClass("disabledDifficulty");var r=100*(3-difficulty);$(".question .question-box .box-content .options").css("padding-left",r+"px"),scoreMultiplier=e}function getDate(){var e=new Date,t=e.getMonth()+1,a=e.getDate(),r=e.getFullYear();return{day:a,month:t,year:r}}function shuffle(e){for(var t=e.length,a,r;0!==t;)r=Math.floor(Math.random()*t),t-=1,a=e[t],e[t]=e[r],e[r]=a;return e}function copyArray(e){var t=JSON.parse(JSON.stringify(e));return t}function commaScore(e){for(;/(\d+)(\d{3})/.test(e.toString());)e=e.toString().replace(/(\d+)(\d{3})/,"$1,$2");return e}var ranks,ranksBackup,rankHistory=[],score=0,scoreMultiplier=1,time=0,maxTime=1600,timer,difficulty,maxDifficulty;$.expr[":"].contains=$.expr.createPseudo(function(e){return function(t){return $(t).text().toUpperCase().indexOf(e.toUpperCase())>=0}}),$(document).ready(function(){function e(){$(".loader").animateIn("fadeIn");var e=$("input[type=text]");$(".reference-field").isotope({filter:function(){var t=!0;return $(this).hasClass("type-"+$("#filter-type").val())||(t=!1),$(this).find('.reference-rank-title:contains("'+e.val()+'")').length||(t=!1),t}}),$(".reference-field").one("arrangeComplete",function(){$(".loader").animateOut("fadeOut")})}function t(e){var t=ranks;e&&(t=e);var a=-1;return a=chance.integer({min:0,max:t.length-1}),t[a]}function a(){var e,a,r=rankHistory.length;do{e=t();var n=ranks;if(-1===rankHistory.indexOf(e.id)&&n.length>=4)return rankHistory.push(e.id),console.log(copyArray(e)),copyArray(e)}while(r==rankHistory.length)}function r(e){var a=[],r,n=ranks;do if(r=t(n),-1===a.indexOf(r)&&r.id!=e.id&&(a.push(r),a.length==difficulty))return a;while(a.length<difficulty)}function n(){var e=rankHistory.length,t=e+1;$(".progress-current").text(t),$(".progress-dots span:lt("+t+")").addClass("active")}function i(){n(),$(".options a").remove();var e=a();e.correct=!0,$(".question-rank-branch").text(e.branch),$(".question-rank-title").text(e.title),$(".question-text").css("opacity","1"),$(".response-images").empty();var t=$('<div><img src="img/'+e.branch+"/"+e.abbreviation+'.png" class="img-responsive"></div>');t.appendTo(".response-images");var i=r(e),o=[e];$.merge(i,o);var c=shuffle(i);$.each(c,function(){var e="";this.correct&&(e='data-correct="true"');var t=$('<a href="#" '+e+' style="display:none;"><img src="img/'+this.branch+"/"+this.abbreviation+'.png" alt="" class="img-responsive"></a>');t.appendTo(".options")}),$(".options a").click(function(){var e='<span class="text-incorrect">Incorrect</span>';if("true"==$(this).attr("data-correct")){e='<span class="text-correct">Correct</span>';var t=500*scoreMultiplier,a=Math.floor((1600-time)/1600*(100*scoreMultiplier)),r=t+a;score+=r,$(".score-current").text(commaScore(score)),$(".score-new").text("+"+commaScore(r)).fadeIn()}else $(".score-new").fadeOut();$(".responseText").html(e),$("#response").modal({backdrop:"static"}),$("#dial").parent().fadeOut(function(){time=0,$("#dial").trigger("change")})}),$(".options a").cascadeIn("fadeInDown",function(){$("#dial").parent().fadeIn(),window.clearInterval(timer),time=0,timer=setInterval(function(){time==maxTime?clearInterval(timer):time+=1,$("#dial").val(time).trigger("change")},1)})}$(window).scroll(function(){$(window).scrollTop()>20?$("body").addClass("scrolled"):$("body").removeClass("scrolled")}),localStorage.ratingScores||$("[data-to=scoreboard]").hide(),$("#dial").knob({readOnly:!0,thickness:1,max:maxTime,width:30,height:30,bgColor:"#1C1C1C",fgColor:"#FFD081"}),$("#dial").parent().hide(),$.getJSON("js/ratings.json",function(e){ranks=e,ranksBackup=ranks,restoreDifficulty(),$.each(ranksBackup,function(e){this.id=e;var t;t=this.branch+"/"+this.abbreviation;var a=$('<a href="#" class="reference-rank branch-'+this.branch+" type-"+this.type+'" data-id="'+this.id+'"><img src="img/'+t+'.png" class="img-responsive"><span class="reference-rank-meta reference-rank-meta-branch" data-branch-label="'+this.branch+'">'+this.branch+'</span><div class="reference-rank-title">'+this.title+"</div></a>").appendTo(".reference-field")}),$(".reference-rank").click(function(){rank=ranksBackup[$(this).attr("data-id")],$(".reference-detail-title").text(rank.title),$(".reference-detail-branch").text(rank.branch),$(".reference-detail-description").text(rank.description),$(".reference-detail-images").empty();var e=$('<div><img src="img/'+rank.branch+"/"+rank.abbreviation+'.png" class="img-responsive"></div>');return e.appendTo(".reference-detail-images"),$("#reference-detail").modal(),!1})}),$("select").change(function(){e()}),$("input[type=text]").keyup(function(){e()}),$(".intro .intro-box .box-content a").click(function(){var e=$(this).attr("data-to");return $(".intro").animateOut("fadeOut",function(){$(".nav-"+e).animateIn("fadeInDown"),$("."+e).animateIn("fadeInDown",function(){"question"==e?(score=0,rankHistory=[],i(),$(".progress-dots span:gt(0)").removeClass("active"),$(".progress-current").text("1")):"reference"==e&&$(".reference-field").isotope()})}),!1}),$("[data-to=scoreboard]").click(function(){function e(e,t){return e.score<t.score?1:e.score>t.score?-1:0}var t=JSON.parse(localStorage.ratingScores);t.sort(e);var a=t[0];$("#scoreboard-high").text(commaScore(a.score)),$("#scoreboard-high-date").text(a.month+"/"+a.day+"/"+a.year),$("#scoreboard-table").empty(),$.each(t,function(e){var t=$("<tr><th>"+(e+1)+"</th><td>"+commaScore(this.score)+"</td></tr>");4>e&&t.appendTo("#scoreboard-table")})}),$("#response .btn-continue").click(function(){$(".question-text").css("opacity","0"),$($(".options a").get().reverse()).cascadeOut("fadeOutDown",function(){rankHistory.length<10?i():($(".nav-question").animateOut("fadeOutUp"),$(".question").animateOut("fadeOutDown",function(){$(".final-score").text(commaScore(score));var e=getDate(),t={score:score,day:e.day,month:e.month,year:e.year},a=1;if(score>=5e3&&(a=2),score>=9e3&&(a=3),a>parseInt(maxDifficulty)&&(maxDifficulty=a,localStorage.maxDifficulty=maxDifficulty),restoreDifficulty(),localStorage.ratingScores){var r=localStorage.ratingScores;r=JSON.parse(r),r.push(t),r=JSON.stringify(r),localStorage.ratingScores=r}else t=JSON.stringify([t]),localStorage.ratingScores=t;$("[data-to=scoreboard]").show(),score=0,rankHistory=[],$(".score-current").text("0"),$(".score-new").fadeOut(),$("#complete").modal()}))})}),$(".btn-difficulty:not(.disabledDifficulty)").click(function(){$(".btn-difficulty").removeClass("setDifficulty"),$(this).addClass("setDifficulty");var e=$(this).attr("data-set-difficulty");return setDifficulty(e,maxDifficulty),!1}),$("#filter-toggle").click(function(){$(".filters").slideToggle(300),$(".reference").toggleClass("filtering")}),$("#back-question").click(function(){$(".nav-question").animateOut("fadeOutUp"),$(".question").animateOut("fadeOutUp",function(){$(".question-rank-title,.question-rank-branch").text(""),$(".intro").animateIn("fadeIn"),$(".options a").hide()})}),$("#back-scoreboard").click(function(){$(".nav-scoreboard").animateOut("fadeOutUp"),$(".scoreboard").animateOut("fadeOutUp",function(){$(".intro").animateIn("fadeIn")})}),$("#back-settings").click(function(){$(".nav-settings").animateOut("fadeOutUp"),$(".settings").animateOut("fadeOutUp",function(){$(".intro").animateIn("fadeIn")})}),$("#back-complete").click(function(){$(".intro").animateIn("fadeIn")}),$("#back-reference").click(function(){$(".nav-reference").animateOut("fadeOutUp"),$(".reference").animateOut("fadeOut",function(){$(".intro").animateIn("fadeIn"),$(".options a").hide()})})});