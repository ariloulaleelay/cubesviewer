/*
 * CubesViewer
 * Copyright (c) 2012-2015 Jose Juan Montes, see AUTHORS for more details
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * If your version of the Software supports interaction with it remotely through
 * a computer network, the above copyright notice and this permission notice
 * shall be accessible to all users.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * This addon adds export to CSV capability to CubesViewer cube view.
 * It offers an "export facts" menu option for all cube view modes,
 * and a "export table" option in Explore and Series mode.
 */
function cubesviewerViewCubeExporter() {

	this.cubesviewer = cubesviewer;

	/*
	 * Draw export options.
	 */
	this.onViewDraw = function(event, view) {

		//if (view.params.mode != "explore") return;

		view.cubesviewer.views.cube.exporter.drawMenu(view);

	};

	/*
	 * Draw export menu options.
	 */
	this.drawMenu = function(view) {

		if (view.cube == null) return;

		var menu = $(".cv-view-menu-view", $(view.container));
		var cube = view.cube;

		// Draw menu options (depending on mode)

		menu.append('<div></div>');
		if ((view.params.mode == "explore") || (view.params.mode == "series")) {
			menu.append('<li><a href="#" class="cv-view-export-table"><span class="ui-icon ui-icon-script"></span>Export table</a></li>');
		}
		menu.append('<li><a href="#" class="cv-view-export-facts"><span class="ui-icon ui-icon-script"></span>Export facts</a></li>');

		$(menu).menu( "refresh" );
		$(menu).addClass("ui-menu-icons");

		// Events
		$(view.container).find('.cv-view-export-table').click(function() {
			view.cubesviewer.views.cube.exporter.exportCsv(view);
			return false;
		});
		$(view.container).find('.cv-view-export-facts').click(function() {
			view.cubesviewer.views.cube.exporter.exportFacts(view);
			return false;
		});
	};

	/*
	 * Download facts in CSV format from Cubes Server
	 */
	this.exportFacts = function(view) {

		var params = {}
		var args = view.cubesviewer.views.cube.buildBrowserArgs(view, false, true);

		params = args;
		if(args && args.cut)
			params.data.cut = params.data.cut.toString();

		params["format"] = "csv";

		var url = view.cubesviewer.options.cubesUrl + "/cube/" + view.cube.name + "/facts?" + $.param(params);
		window.open(url, '_blank');
		window.focus();
	};

	/*
	 * Export a view (either in "explore" or "series" mode) in CSV format.
	 */
	this.exportCsv = function (view) {

		var content = "";

		var firstIndex = 0;
		if (view.params.mode == "explore") {
			var grid = $('#summaryTable-' + view.id);
			firstIndex = 1;
		} else {
			var grid = $('#seriesTable-' + view.id);
		}

		var values = [];
		var labels = grid.jqGrid('getGridParam','colNames');
		var model = grid.jqGrid('getGridParam','colModel');
		var data = grid.jqGrid('getGridParam', 'data');

		for (var i = firstIndex; i < model.length; i++) {
			if (view.params.columnHide[model[i].name])
				continue;
			var label = labels[i];
			label = label.replace(/"/g, '\\"');
			values.push('"' + label + '"');
		}

		content = content + (values.join(",")) + "\n";

		for (var i = 0; i < data.length; i++) {
			values = [];
			for (var j = firstIndex; j < model.length; j++) {
				var name = model[j].name;
				if (view.params.columnHide[name])
					continue;
				var colval = data[i][name];
				colval = $('<div>' + colval + '</div>').text(); // TODO ???
				if (colval == undefined) colval = 0;
				colval = colval.replace(/"/g, '\\"');
				values.push ('"' + colval + '"');
			}
			content = content + (values.join(",")) + "\n";
		}

		var url = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
		var aLink = document.createElement('a');
		var evt = document.createEvent("HTMLEvents");
		var filename = view.params.name.replace(/\//g, '').replace(/\s+/g, '_');
		evt.initEvent("click");
		aLink.download = filename + '.csv';
		aLink.href = url;
		aLink.target = '_blank';
		aLink.dispatchEvent(evt);
  };
};


/*
 * Create object.
 */
cubesviewer.views.cube.exporter = new cubesviewerViewCubeExporter();

/*
 * Bind events.
 */
$(document).bind("cubesviewerViewDraw", { }, cubesviewer.views.cube.exporter.onViewDraw);

// vim :set ts=4 sw=4:
