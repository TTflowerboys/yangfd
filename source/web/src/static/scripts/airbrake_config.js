var airbrake = new window.airbrakeJs.Client({projectId: 113692, projectKey: '666a2a183ac4ac2191cf8e5736251d69'});
airbrake.setEnvironmentName(window.env)
window.onerror = function(message, file, line, col, error) {
    var report = {error: {message: message, fileName: file, lineNumber: line}}
    if(col) {
        report.error.colNumber = col
    }
    if(error && error.stack) {
        report.params = report.params || {}
        report.params.stack = error.stack
    }
    airbrake.push(report);
}