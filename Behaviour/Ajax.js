SEQWater = {};
SEQWater.BROWSER_MODE = false;

 // Make an ajax call to the web server (too many comments)
 function PerformAjaxCall(dataManager) 
 {
 	$.get('http://www.seqwater.com.au/public/dam-levels',function(doc) {
		// Extract the info from the xml and create javascript Dam objects.
		var dams = ExtractDamObjectsFromDataSource(doc);
		RenderDams(dams);
		$("#WaitDiv").hide();
		
		// Save the xml to the local store using IE's persistence
		// so that the data can be instantly displayed when it next
		// runs.			
		dataManager.save();
	
		// Start a timer to periodically check for new data - once every 6 hours
		clearTimeout(SEQWater.refreshTimer);
		SEQWater.refreshTimer = setTimeout(function() { PerformAjaxCall(dataManager); }, 2 * 60 * 60 * 1000);

	});
 }
 
function getLastUpdateText() {
	// Show the time the the info was last correct at
	var lastUpdate = new Date(SEQWater.lastUpdated * 1);
	var dateString = lastUpdate.toLocaleDateString();
	return dateString.substring(dateString.indexOf(',') + 2, dateString.length);
}

// Display the dams to the browser.
function RenderDams(dams)
{	
	// 'total' is an instance of the Dam object and it can render itself
	SEQWater.total.Render();
	var dateString = getLastUpdateText();
	$("#InfoLastUpdated").text(dateString);
	
	// Each dam object knows how to render itself
	for(index in dams)
	{
		dams[index].Render();
	}
}

// Javascript object that represents a dam
function Dam(name, fullSupplyLevel, volume, level, stored, percent, change, rain)
{
	this.name = name;
	this.fullSupplyLevel = fullSupplyLevel;
	this.volume = volume;
	this.level = level;
	this.stored = stored;
	this.percent = percent;
	this.change = change;
	this.rain = rain;

	var nameCode = this.name.substring(0, 3);
	var nameWithGraphCode = "Graph" + nameCode;		

	// Object method to render itself
	this.Render = function()
	{
		var percentage = this.stored / this.volume * 100;
		var remaining = percentage > 100 ? 0 : 100-percentage;

		var fullGraph = $("#" + nameWithGraphCode + "Full");
		var emptyGraph = $("#" + nameWithGraphCode + "Empty");
		var percentGraph = $("#" + nameWithGraphCode + "Percent");
		var altFormatGraph = $("#altFormat");
		
		var rainElem = $("#Rain" + nameCode);
		var deltaElem = $("#Delta" + nameCode);

		fullGraph.width(Math.min(100,percentage));
		emptyGraph.width(remaining);
		percentGraph.text(percentage.toFixed(2) + "%");
		fullGraph.attr('alt', altFormatGraph.text().replace("{0}", this.stored).replace("{1}", this.volume));
		emptyGraph.attr('alt', fullGraph.attr('alt'));
		rainElem.text(this.rain + " mm");
		deltaElem.text(parseFloat(this.change).toFixed(3) + "%");
	}
}

function dummyData() {
	var wivenhoe = new Dam('Wivenhoe', "67", "1165238", "0", "1190216", "100", "0.000", "0");
	var totals = new Dam('Totals', "-", "1759389", "0", "1797205", "100", "0.000", "0");
	var northPine = new Dam('North Pine', "39.63", "214302", "0", "213450", "99.6", "0.000", "0");
	var somerset = new Dam('Somerset', "99", "379849", "0", "393539", "100", "0.000", "0");

	SEQWater.lastUpdated = '1292508000000';
	SEQWater.rateOfConsumption = 686000000.0;

	SEQWater.total = totals;
	return [wivenhoe, northPine, somerset];
}

function extractDataFromHTML(htmldoc) {
	var dams = [];
	
	$(htmldoc).find('.TableDataAllDams:last').find('tbody').find('tr').each(function(i) {
		var dam_name_tag = $(this).find('td').first();
		
		dam_name_tag.text().match(/(.+) Dam/);
		var dam_name = RegExp.$1;

		dam_name_tag.attr('id').match(/dam(\d+)Nam/);
		var dam_id = RegExp.$1;				

		dams[dam_name] = new Dam(
					dam_name,
					-1,
					$(htmldoc).find('#dam'+dam_id+'Max').text().replace(/,/g,''),
					"0",
					$(htmldoc).find('#dam'+dam_id+'Vol').text().replace(/,/g,''),
					$(htmldoc).find('#dam'+dam_id+'Per').text().replace(',',''),
					"0.0000",
					0
				);
				
	});
	
	dams['Wivenhoe'].fullSupplyLevel = 67;
	dams['North Pine'].fullSupplyLevel = 39.63;
	dams['Somerset'].fullSupplyLevel = 99;

	SEQWater.lastUpdated = $(htmldoc).find('.TableDataAllDams').find('h2').first().text();
	SEQWater.rateOfConsumption = 686000000.0;
	
	SEQWater.total = new Dam('Totals', "-", $(htmldoc).find('#dam30Max').text().replace(/,/g,''), "0", $(htmldoc).find('#dam30Vol').text().replace(/,/g,''), $(htmldoc).find('#dam30Per').text().replace(/,/g,''), "0.000", "0");
	return [dams['Wivenhoe'], dams['North Pine'], dams['Somerset']];
}

function extractDataFromXml(xmldoc) {
	// Get the date of the last update and the rate of consumption
	SEQWater.lastUpdated = $(xmldoc).find('root').attr('lastUpdated');
	SEQWater.rateOfConsumption = parseFloat($(xmldoc).find('root').attr('rateOfConsumption'));
	
	var dams = [];
	$(xmldoc).find('dam').each( function(i) {
		var elem = $(this);
		var dam  = new Dam(
			elem.attr('name'),
			elem.find('fullSupplyLevel').text(),
			elem.find('volume').text(),
			elem.find('level').text(),
			elem.find('stored').text(),
			elem.find('percent').text(),
			elem.find('change').text(),
			elem.find('rain').text()
		);
		
		if (dam.name == "Totals")
		{
			// We have a total object that the totals are stored in	
			SEQWater.total = dam;
		}
		else
		{
			// Add the dam into the array of dams
			dams.push(dam);
		}
	});

	return dams;
}

// Extact the information from the XML from the ajax call 
// and create an array of Dams
function ExtractDamObjectsFromDataSource(doc)
{
	if (SEQWater.BROWSER_MODE) return dummyData();
	if (doc != null) return extractDataFromHTML(doc);
}