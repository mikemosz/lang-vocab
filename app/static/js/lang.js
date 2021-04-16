function objectClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getDataRow(plot, series, index) {
	return plots[plot].data[series][index];
}

function getDataRowFromPt(pt) {
	return getDataRow(pt.data.plot, pt.data.series, pt.pointIndex);
}

function populateTemplate($element, row) {
	for (key in row) {
		$("*[cs-data-field='" + key + "']", $element).text(row[key]);
	}
}

function loadDetail(url, pt) {
	console.log(pt);
	row = getDataRowFromPt(pt);

	$detail = $('#detail-' + pt.data.plot + '-' + pt.data.series);

	if (!$detail.length) {
		$detail = $('#detail-' + pt.data.plot);
	}

	$detail.load(url + '?' + $.param({series: pt.data.series, id: row['_id']}));
}

function showTooltip(d, pt) {
	$tooltip = $('#tooltip-' + pt.data.plot);
	
	if (!$tooltip.length) {
		$tooltip = $('#tooltip-' + pt.data.plot + '-' + pt.data.series);
	}

	if ($tooltip.length) {
		row = getDataRowFromPt(pt);
		populateTemplate($tooltip, row);

		if (pt.ct) {
			xpos = curMouseX + 5;
			ypos = curMouseY + 5;
		}
		else {
			xaxis = d.xaxes[0];
			yaxis = d.yaxes[0];

			position = $('#' + pt.data.plot).position()
			xpos = xaxis.c2p([pt.lon, pt.lat]) + xaxis._offset + position.left + 10;
			ypos = yaxis.c2p([pt.lon, pt.lat]) + yaxis._offset + position.top;
		}

		$tooltip.css({'left': xpos, 'top': ypos})
		$tooltip.show()
	}
}

function setupPlot(name, plot) {
	plotContainer = document.getElementById(name)
	Plotly.newPlot(plotContainer, tracesForPlot(plot.traces), plot.layout, plot.config);
	plots[name] = plot;
	return plotContainer;
}

function scatterOutlineTrace(trace) {
	outlineTrace = objectClone(trace);
	outlineTrace.marker.color = 'black';
	outlineTrace.marker.size = trace.marker.size + 2;
	return outlineTrace;
}

function tracesForPlot(traces) {
	outTraces = [];

	traces.forEach(function(trace) {
		if (trace.type == 'scattermapbox') {
			outTraces.push(scatterOutlineTrace(trace));
		}

		outTraces.push(trace);
	});

	return outTraces;
}

function selectElement(element, traceName, selectIndex) {
	outTraces = [];

	mapPlot.traces.forEach(function(trace) {
		newTrace = objectClone(trace)
		newTrace.marker.opacity = trace.marker.opacity - 0.5;
		outTraces.push(newTrace);
		
		if (trace.name == traceName) {
			selectedTrace = objectClone(trace);
			selectedTrace.lat = [selectedTrace.lat[selectIndex]];
			selectedTrace.lon = [selectedTrace.lon[selectIndex]];
			selectedTrace.marker.opacity = 1;
			selectedTrace.name = 'selected';

			outTraces.push(scatterOutlineTrace(selectedTrace));
			outTraces.push(selectedTrace);
		}
	});

	Plotly.react(element, outTraces, mapLayout, mapConfig);
}

function clearSelection(element) {
	Plotly.react(element, tracesForPlot(mapPlot.traces), mapLayout, mapConfig);
}

var plots ={};
var curMouseX = 0;
var curMouseY = 0;

$(document).mousemove(function(evt) {
	curMouseX = event.pageX;
	curMouseY = event.pageY;
});
