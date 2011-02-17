/*
 * Oekaki Editor v0.1
 * Copyright © 2011 Geoffrey Roberts, g.roberts@blackicemedia.com
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 */

var OekakiEditor = function( wrapperElem )
{
	var Editor = this;
	
	this.state = {
		_container: null,
		_elem: null,
		_ctx: null,
		_previous: { x:0, y:0 },
		_size: { w:0, h:0 },
		_seltool: null,
		_seltoolname: null,
		_tool: null,
		_field: null,
		_active: false
	};
	
	this.settings = {
		brush: {
			size: 4,
			stroke: "black"
		},
		eraser: {
			size: 4
		}
	};
	
	this.tools = {
		brush: function( x, y )
		{
			Editor.state._ctx.lineWidth = Editor.settings.brush.size;
			Editor.state._ctx.strokeStyle = Editor.settings.brush.stroke;
			Editor.state._ctx.beginPath();
			Editor.state._ctx.moveTo(Editor.state._prev.x, Editor.state._prev.y);
			Editor.state._ctx.lineTo(x,y);
			Editor.state._ctx.stroke();
			Editor.state._prev = { x:x, y:y };
		},
		eraser: function( x, y )
		{
			Editor.state._ctx.clearRect(
				x - (Editor.settings.eraser.size / 2), 
				y - (Editor.settings.eraser.size / 2), 
				Editor.settings.eraser.size,
				Editor.settings.eraser.size
			);
			Editor.state._prev = { x:x, y:y };
		}
	};
	
	this.actions = {
		download: function()
		{
			if( !Editor.state._active ) return;
			if( !Editor.state._elem ) alert("You haven't started an image yet!");
			else Canvas2Image.saveAsPNG(Editor.state._elem);
		},
		exportdata: function()
		{
			if( !Editor.state._active ) return;
			if( !Editor.state._elem ) return null;
			return Editor.state._elem.toDataURL("image/png");
		},
		paint: function(e)
		{
			if( !Editor.state._active ) return;
			if( Editor.state._tool != null )
			{
				var x = e.pageX - Editor.state._elem.offsetLeft;
				var y = e.pageY - Editor.state._elem.offsetTop;
				Editor.state._tool( x, y );
			}
		},
		startPaint: function(e)
		{
			if( !Editor.state._active ) return;
			Editor.state._tool = Editor.state._seltool;
			var x = e.pageX - Editor.state._elem.offsetLeft;
			var y = e.pageY - Editor.state._elem.offsetTop;
			Editor.state._prev = { x:x, y:y };
			Editor.actions.paint(e);
		},
		stopPaint: function(e)
		{
			if( !Editor.state._active ) return;
			Editor.state._tool = null;
			Editor.state._field.value = Editor.actions.exportdata();
		},
		selectSize: function()
		{
			var newSize = this.value;
			if( Editor.state._seltool != null && Editor.state._seltoolname != null )
			{
				Editor.settings[ Editor.state._seltoolname ].size = newSize;
				
				var toolContainer = Editor.state._container.getElementsByClassName('oekaki-widget-tools')[0];
				var sizeButtons = toolContainer.getElementsByClassName('oekaki-widget-size-button');
				for( var i in sizeButtons )
				{
					if( sizeButtons[i].nodeType == undefined || sizeButtons[i].nodeType != 1 ) continue;
					var button = sizeButtons[i];
					button.className = button.className.replace('selected', '');
				}
				this.className += " selected";
			}
		},
		selectTool: function()
		{
			var toolContainer = Editor.state._container.getElementsByClassName('oekaki-widget-tools')[0];
			var toolButtons = toolContainer.getElementsByClassName('oekaki-widget-tool-button');
			for( var i in toolButtons )
			{
				if( toolButtons[i].nodeType == undefined || toolButtons[i].nodeType != 1 ) continue;
				var button = toolButtons[i];
				button.className = button.className.replace('selected', '');
			}
			this.className += " selected";
			
			var toolMatch = this.className.match(/oekaki-tool-([a-z-]+)/);
			var toolName = toolMatch[1];
			
			var sizeButtons = toolContainer.getElementsByClassName('oekaki-widget-size-button');
			for( var i in sizeButtons )
			{
				if( sizeButtons[i].nodeType == undefined || sizeButtons[i].nodeType != 1 ) continue;
				
				var button = sizeButtons[i];
				button.className = button.className.replace('selected', '');
				if( button.value == Editor.settings[ toolName ].size )
				  button.className += " selected";
			}
			Editor.state._seltool = Editor.tools[ toolName ];
			Editor.state._seltoolname = toolName;
		}
	};
	
	this.initTools = function()
	{
		var toolContainer = Editor.state._container.getElementsByClassName('oekaki-widget-tools')[0];
		
		for( var i in toolContainer.childNodes )
		{
			if( toolContainer.childNodes[i].nodeType == undefined || toolContainer.childNodes[i].nodeType != 1 ) continue;
			
			var tool = toolContainer.childNodes[i].getElementsByTagName('input')[0];
			
			if( tool.type == 'color' )
			{
				tool.onchange = function()
				{
					Editor.settings.brush.stroke = '#'+this.value;
				};
			}
			if( tool.className.indexOf('oekaki-widget-tool-button') >= 0 )
			{
				tool.onclick = Editor.actions.selectTool;
			}
			else if( tool.className.indexOf('oekaki-widget-size-button') >= 0 )
			{
				tool.onclick = Editor.actions.selectSize;
			}
			else if( tool.className.indexOf('oekaki-widget-download-button') >= 0 )
			{
				tool.onclick = Editor.actions.download;
			}
			else
			{
				/* button.onclick = window[ button.id.toString() ]; */
			}
		}
	};
	
	this.init = function( wrapperElem )
	{
		//try
		//{
			Editor.state._container = wrapperElem;
			Editor.state._elem  = Editor.state._container.getElementsByTagName( 'canvas' )[0];
			Editor.state._field  = Editor.state._container.getElementsByClassName( 'oekaki-image-datafield' )[0];
			
			Editor.state._ctx   = Editor.state._elem.getContext('2d');
			
			Editor.state._elem.onmousedown = Editor.actions.startPaint;
			Editor.state._elem.onmouseup   = Editor.actions.stopPaint;
			Editor.state._elem.onmousemove = Editor.actions.paint;
			
			Editor.initTools();
			
			Editor.state._elem.parentNode.className += " oekaki-widget-active";
			Editor.state._active = true;
		//}
		//catch(ex)
		//{
		//	alert(ex.message);
		//}
	};
	
	this.init( wrapperElem );
};
