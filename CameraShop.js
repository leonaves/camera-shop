// ******************************************************
// ** YOU MUST NOT CHANGE ANY OF THE CODE IN THIS FILE **
// ** UNLESS AUTHORISED TO DO SO BY THE MODULE LEADER  **
// ******************************************************

var productsDomTree;
var carouselProductsDomTree;
var searchResultsDomTree;
var $products = null;
var $carousel = null;
var $sResults = null;
var vars = [], hash;
var q = document.URL.split('?')[1];
var productURL = "products.php";

//  Check if we have a Query String
if (q != undefined)
{	
	// Break up the Query String into the variable:value pairs
	var qs = q.split('&');
	for (var i = 0; i < qs.length; i++)
	{
		hash = qs[i].split('=');
		vars.push(hash[1]);
		vars[hash[0]] = hash[1];
	}
	
	// Check if we need to get search engine results
	if (vars["searchTerm"] != undefined)
	{
		// Need to get the carousel products
		$.get(productURL + "?" + q, function( s_data )
		{
			searchResultsDomTree = $.parseXML( s_data );
			$sResults = $( searchResultsDomTree );
		});
	}
}
else
{
	// Need to get the carousel products
	$.get(productURL + "?carousel=1", function( c_data )
	{
		carouselProductsDomTree = $.parseXML( c_data );
		$carousel = $( carouselProductsDomTree );
	});
}
		

// Load XML as an XML DOM tree
$.get(productURL, function( data )
{
	//alert("Success :" + data);
	productsDomTree = $.parseXML( data );
	$products = $( productsDomTree );
});


function populateNav(theClass)
{
	//For each product in the XML tree
	$products.find("product").each(function() {
	
		// Get the top-level and sub-level category from the product attributes
		var top = $(this).attr("top-level-category");
		var sub = $(this).attr("sub-level-category");
		
		// Get the product title and id
		var title = $(this).find('title').text();
		var id = $(this).find('id').text();
		
		// Check if top level category list item exists
		if ($("." + theClass).find("li:contains('"+ top + "')").length == 0)
		{
			// top level category does not exist, so create it
			$("." + theClass).append("<li class='navmenuItem menuItem'>" + top + "<ul class='subMenu'></ul></li>");
		}
		
		
		// Check if sub level category list item exists
		if ($("." + theClass).find("li:contains('"+ top + "')").find("ul:first").first().find("li:contains('" + sub + "')").length == 0)
		{
			// sub level category does not exist, so create it
			$("." + theClass).find("li:contains('"+ top + "')").find("ul:first").first().append("<li class='menuItem'>" + sub + "<ul class='subMenu subsubMenu'></ul></li>");
		}
		
		// Add the product as a anchored list item in the sub menu
		$("." + theClass).find("li:contains('"+ top + "')").find("ul:first").find("li:contains('" + sub + "')").find("ul:first")
			.append("<li class='menuItem submenuItem'><a href='product.html?id=" + id + "'>" + title + "</a></li>");
		
	});
	
	// Sort out hovers
	$("." + theClass).find("li:has('ul')").hover(function() {
		$(this).find('ul:first').first().addClass("menuItemHover");
		$(this).addClass("chosenItem");
	}, function() {
		$(this).find('ul:first').first().removeClass("menuItemHover");
		$(this).removeClass("chosenItem");
	});
	
	// Sort out anchor tag styling
	$("." + theClass + " a").addClass("anchorMenuItem");
}

var carouselImage = [];
var carouselTitle = [];
var carouselCost = [];
var carouselID = [];
var theImage = $('img');

function preloadCarouselImages()
{
	// For each product
	$carousel.find("product").each(function() {
	
		//console.log($(this));
		// Get the data from the product
		var imgSrc = $(this).find("picture").text();
		var imgTitle = $(this).find("title").text();
		var imgCost = $(this).find("price").text();
		var imgID = $(this).find("id").text();
		
		// Load the image into the browser cash
		theImage.attr('src', "./ProductImages/" + imgSrc);
		
		// Save the data for the carousel in the carousel arrays
		carouselImage.push(imgSrc);
		carouselTitle.push(imgTitle);
		carouselCost.push(imgCost);
		carouselID.push(imgID);
	});
	
	// If you wanted to randomise the elements in the carousel arrays... that code would go here
}

var carouselItem = 0;

function animateIn(theID)
{
	// Animate new one in
	$("#" + theID)
		.css("background", "url(./ProductImages/" + carouselImage[carouselItem] + ") no-repeat")
		.css("background-position", "100% 50%");
	$('#title').text(carouselTitle[carouselItem]);
	$('#price').html("Only \&pound\;" + carouselCost[carouselItem]);
	$('#price').css("left", "-500px");
	$('#title').css("right", "-500px");
	$('#price').animate( { left: "+=525" }, 250);
	$('#title').animate( { right: "+=525" }, 250);
	$("#" + theID).animate( { backgroundSize: "55%", 'background-position-x': "50%" }, 500); 
}

function startCarousel(theID)
{
	$("#" + theID)
		.css("background", "url(./ProductImages/" + carouselImage[0] + ") no-repeat")
		.css("background-size", "0")
		.css("background-position", "50% 50%");

	// Insert the title and price text
	$("#" + theID).append("<div id='title' class='titleStart'>" + carouselTitle[0] + "</div><div id='price' class='priceStart'>Only &pound" + carouselCost[0] + "</div>");
	
	// Animate the background, the price and title text
	$("#" + theID).animate( { backgroundSize: "55%" }, 500); 
	$('#price').animate( { left: "+=525" }, 250);
	$('#title').animate( { right: "+=525" }, 250);
	
	// Set up the timed event;
	window.setInterval(function() {
	
		// Check for end of items in carousel
		if (carouselItem == carouselID.length - 1)
		{
			carouselItem = 0;
		}
		else
		{
			carouselItem++;
		}
	
		// Animate old one out
		$("#" + theID).animate( { 'background-position-x': "0%", backgroundSize: "0%" }, 500, function() { animateIn(theID); }); 
		$('#price').animate( { left: "+=1025" }, 250);
		$('#title').animate( { right: "+=1025" }, 250);
	
	}, 7000);
	
	// Add the click event to theID
	$('#' + theID).click(function() {
		window.location.href="product.html?id=" + carouselID[carouselItem];
	});
}	