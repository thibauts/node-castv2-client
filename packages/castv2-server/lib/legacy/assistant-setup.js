// var head = '<meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script><script src="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/semantic.min.js"></script> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/semantic.min.css"> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/components/container.min.css"> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/components/grid.min.css"> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/components/button.min.css"> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/components/step.min.css"> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/components/message.min.css"> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.3/dist/components/icon.min.css">';
// var mainContainerStart = '<div class="ui stackable grid"><div class="two wide column"></div><div class="twelve wide column">';
// var mainContainerEnd = '</div><div class="two wide column"></div>';
// var pre = '<html><head>'+head+'</head><body>'+mainContainerStart+'<h1>Setup Google Assistant</h1><script>var tokenSuccess = false;</script>';
// var post = mainContainerEnd+'</body>';

var errorPre = '\'<div class="ui message negative"><i class="close icon"></i><div class="header">An error occured</div><p>\'';
var errorPost = '\'</p></div>\'';

var successPre = '\'<div class="ui message positive"><i class="close icon"></i><div class="header">Success!</div><p>\'';
var successPost = '\'</p></div>\'';

function getSteps(number) {
	var active = ['', '', '', ''];
	active[number] = 'active ';

	var pre = '<div class="ui ordered fluid steps">';
	var post = '</div><script>$(".message .close").on("click", function() {$(this).closest(".message").transition("fade");});</script>';
	var step1 = '<a class="'+active[1]+'step" href="/lib/assistant/setup/1"><div class="content"><div class="title">Sign up</div><div class="description">Get API ID and secret</div></div></a>';
	var step2 = '<a class="'+active[2]+'step" href="/lib/assistant/setup/2"><div class="content"><div class="title">Authorize</div><div class="description">Access to your Google account</div></div></a>';
	var step3 = '<a class="'+active[3]+'step" href="/lib/assistant/setup/3"><div class="content"><div class="title">Save</div><div class="description">Save your authorization code</div></div></a>';
	var stepsJS = '<script>$.ajax("/assistant/setup/status/").done(function(e){e.setup&&(e.setup.id&&e.setup.secret&&$(".ui.ordered.fluid.steps>a").eq(0).addClass("completed"),e.setup.token&&($(".ui.ordered.fluid.steps>a").eq(1).addClass("completed"),$(".ui.ordered.fluid.steps>a").eq(2).addClass("completed")))});</script>';

	return (pre+step1+step2+step3+post+stepsJS);
}

//STEP 1
// var step1Disclaimer = '<div class="ui warning message"><div class="header">Disclaimer</div><p>This feature is experimental. It requires a dedicated setup and might not work as expected. The Google Assistant broadcast feature might not work all the time or on all of your devices. These issues are beyond my control!</p></div>';
var step1Content = '<h2>1. Configure a Developer Project</h2><p>You will need a Client ID and Client secret. <strong>Make sure to select the "Other" application type when creating an oAuth Client ID.</strong></p><p><a href="https://developers.google.com/assistant/sdk/guides/service/python/embed/config-dev-project-and-account" target="_blank" class="ui button">Follow this guide</a></p>';
var step1Content = step1Content + '<h2>2. Paste your Client ID and Client secret</h2>';
var step1Content = step1Content + '<div class="ui form"><div class="two fields"><div class="field"><label>Client ID</label><input type="text" id="client-id" placeholder="Client ID"></div><div class="field"><label>Client secret</label><input type="text" id="client-secret" placeholder="Client secret"></div></div></div>';
var step1Content = step1Content + '<button style="float: right;" class="ui right labeled icon primary button" id="save-btn"><i class="save icon"></i><div>Save</div></button><a style="float: right; display: none;" class="ui right labeled icon green button" id="next-btn" href="/lib/assistant/setup/2"><i class="arrow right icon"></i><div>Next</div></a>';
var step1JS = '<script>$("#save-btn").click(function(){$.ajax("/assistant/setup/id/"+$("#client-id")[0].value).always(function(){$("#save-btn").removeClass("right labeled icon").addClass("loading")}).done(function(e){$.ajax("/assistant/setup/secret/"+$("#client-secret")[0].value).always(function(){$("#save-btn").removeClass("right labeled icon").addClass("loading")}).done(function(e){$("#save-btn").removeClass("loading primary red").addClass("right labeled icon green"),$("#save-btn > div").text("Done"),$("#save-btn > i").removeClass("save times").addClass("check"),window.setTimeout(function(){$("#save-btn").hide(),$("#next-btn").show()},1e3)}).fail(function(e){var s="No error message provided.";e&&e.responseJSON&&(s=e.responseJSON.error),$(".ui.ordered.fluid.steps").after('+errorPre+'+s+'+errorPost+'),$("#save-btn").removeClass("loading primary green").addClass("right labeled icon red"),$("#save-btn > div").text("Error"),$("#save-btn > i").removeClass("check save").addClass("times")})}).fail(function(e){var s="No error message provided.";e&&e.responseJSON&&(s=e.responseJSON.error),$(".ui.ordered.fluid.steps").after('+errorPre+'+s+'+errorPost+'),$("#save-btn").removeClass("loading primary green").addClass("right labeled icon red"),$("#save-btn > div").text("Error"),$("#save-btn > i").removeClass("check save").addClass("times")})});</script>';

//STEP 2
var step2Content = '<p>Click the button below to authorize cast-web-api with your Google Account.<br><br> Copy the code you received, click next and paste it in the next step.<p><a href="https://developers.google.com/assistant/sdk/guides/service/python/embed/config-dev-project-and-account" target="_blank" class="ui button" id="auth-btn">Authorize</a></p>';
var step2Content = step2Content + '<a style="float: right;" class="ui right labeled icon green button" id="next-btn" href="/lib/assistant/setup/3"><i class="arrow right icon"></i><div>Next</div></a>';
var step2JS = '<script>$.ajax("/assistant/setup/getTokenUrl/").always(function(){$("#auth-btn").addClass("loading")}).done(function(r){console.log(r.url),$("#auth-btn").removeClass("loading").attr("href",r.url)}).fail(function(r){var e="No error message provided.";r&&r.responseJSON&&(e=r.responseJSON.error),$(".ui.ordered.fluid.steps").after('+errorPre+'+e+'+errorPost+'),$("#auth-btn").removeClass("loading").addClass("red"),$("#auth-btn > div").text("Error getting auth url")});</script>';

//STEP 3
var step3MoreInfoJS = '<script>function setInfoLink(){ $(".ui.message.positive > p > strong > a").attr("href", "https://vervallsweg.github.io/cast-web/category/faq/").attr("target", "_blank");};</script>';
var step3Content = '<p>Paste the oAuth code you copied before, press save and wait for the confirmation.</p><div class="ui form"><div class="field"><label>oAuth code</label><input type="text" id="token"></div></div><br>';
var step3Content = step3Content + step3MoreInfoJS;
var step3Content = step3Content + '<button style="float: right;" class="ui right labeled icon primary button" id="save-btn"><i class="save icon"></i><div>Save</div></button>';
var step3JS = '<script>$("#save-btn").click(function(){tokenSuccess||$.ajax("/assistant/setup/token/"+$("#token")[0].value).always(function(){$("#save-btn").removeClass("right labeled icon").addClass("loading")}).done(function(e){$("#save-btn").removeClass("loading primary red").addClass("right labeled icon green"),$(".ui.ordered.fluid.steps").after('+successPre+'+"You are all set. Now you can select the cast-web-api device in your Smartthings app as a device for reading out messages. <strong>Remember: only the speech synthesis capability (e.g. speak) is supported <a>more info</a>.</strong>"+'+successPost+'),$("#save-btn > div").text("Done"),$("#save-btn > i").removeClass("save times").addClass("check"),tokenSuccess=!0,setInfoLink()}).fail(function(e){var s="No error message provided.";e&&e.responseJSON&&(s=e.responseJSON.error),$(".ui.ordered.fluid.steps").after("+errorPre+"+s+"+errorPost+"),$("#save-btn").removeClass("loading primary green").addClass("right labeled icon red"),$("#save-btn > div").text("Error"),$("#save-btn > i").removeClass("check save").addClass("times")})});</script>';

// var step1 = pre + step1Disclaimer + getSteps(1) + step1Content + step1JS + post;
// var step2 = pre + getSteps(2) + step2Content + step2JS + post;
// var step3 = pre + getSteps(3) + step3Content + step3JS + post;

// module.exports = {step1: step1, step2: step2, step3: step3};