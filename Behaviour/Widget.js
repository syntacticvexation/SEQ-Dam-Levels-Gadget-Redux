function getRealWidget() {
	function setBackground() {
		var bg = System.Gadget.Settings.read("background");
		var background = System.Gadget.Settings.read("background") || "Default.png";
		System.Gadget.background = "Backgrounds/" + background;	
	}
	
	function init() {
		// Called when the settings are closed.
	    System.Gadget.settingsUI = "Settings.html";
	    System.Gadget.onSettingsClosed = SettingsClosed;
	    function SettingsClosed() {
			setBackground();
	    }
	}
	
	function writeTab(tab) {
		System.Gadget.Settings.write("tab", tab);
	}
	
	function getInitialTab() {
		if (System.Gadget.Settings.read("tab")) return System.Gadget.Settings.read("tab");
		else return "Graph";
	}
	
	return {
		init : init,
		setBackground : setBackground,
		writeTab : writeTab,
		getInitialTab : getInitialTab
	};
}

function getFakeWidget() {
	return { 
		init : function() {}, 
		setBackground : function() {}, 
		writeTab : function() {}, 
		getInitialTab : function() { return "Graph"; } 
	};
}

function getXmlDataManager() {
	return {
		save : function(xmldoc) {
			var oPersist=oPersistForm.oPersistInput;
			oPersist.value = xmldoc.xml;
	 		oPersist.setAttribute("sPersist",oPersist.value);
	 		oPersist.save("oXMLBranch");
		},
		load : function() {
		return null;
			try
			{
		  		var oPersist=oPersistForm.oPersistInput;
				oPersist.load("oXMLBranch");		
	  			oPersist.value=oPersist.getAttribute("sPersist");

				var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.3.0");
				xmlDoc.async = false;
				xmlDoc.loadXML(oPersist.value);
				return xmlDoc;
			}
			catch(err)		
			{
				return null;
			}
		}
	};
}
		
function getFakeDataManager() {
	return { 
		save : function() { }, 
		load : function() { return "1"; }
	};
}

