var oekakiEditors = [];

var SetupWidgets = function()
{
	var widgets = document.getElementsByClassName('oekaki-widget');
	for(var i in widgets)
	{
		var widget = widgets[i];
		if(!widget.innerHTML) continue;
		var index = oekakiEditors.length;
		oekakiEditors[ index ] = new OekakiEditor( widget );
	}
};

if (document.addEventListener)
  document.addEventListener("DOMContentLoaded", SetupWidgets, false)