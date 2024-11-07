// ==UserScript==
// @name        OLED Black and Purple Theme
// @namespace   Violentmonkey Scripts
// @match       https://*cesdk12.org/*
// @version     1.0
// @author      -
// @grant       GM_getResourceURL
// @resource    homeIcon https://img.icons8.com/ios-glyphs/50/ffffff/home.png
// @resource    mailIcon https://img.icons8.com/ios-glyphs/50/ffffff/secured-letter--v1.png
// @resource    calendarIcon https://img.icons8.com/ios-glyphs/50/ffffff/calendar.png
// @resource    attendanceIcon https://img.icons8.com/ios-glyphs/50/ffffff/checkmark.png
// @resource    scheduleIcon https://img.icons8.com/ios-glyphs/50/ffffff/day-view.png
// @resource    courseHistoryIcon https://img.icons8.com/ios-glyphs/50/ffffff/time-machine--v1.png
// @resource    gradebookIcon https://img.icons8.com/ios-glyphs/50/ffffff/font-book.png
// @resource    mtssIcon https://img.icons8.com/ios-glyphs/50/ffffff/task.png
// @resource    reportCardIcon https://img.icons8.com/ios-glyphs/50/ffffff/report-card.png
// @resource    schoolInfoIcon https://img.icons8.com/ios-glyphs/50/ffffff/school-building.png
// @resource    studentInfoIcon https://img.icons8.com/ios-glyphs/50/ffffff/user--v1.png
// @resource    documentsIcon https://img.icons8.com/ios-glyphs/50/ffffff/documents.png
// @description Theme your StudentVUE!
// ==/UserScript==

(function() {
    'use strict';

    function waitForElement(selector, callback) {
        const interval = setInterval(() => {
            const elements = document.getElementsByClassName(selector);
            if (elements.length > 0) {
                clearInterval(interval);
                callback(elements);
            }
        }, 100); // Check every 100 milliseconds
    }

    function waitForCSS() {
        const interval = setInterval(() => {
            const element = document.getElementById("CssTheme");
            if (element) {
              element.remove();
            }
        }, 100); // Check every 100 milliseconds
    }

    function parseClassInfo(input) {
        const cleanedInput = input.slice(5);
        const parts = cleanedInput.split(' ');
        const teacher = parts.slice(0, 2).join(' ');
        const className = cleanedInput.split('(')[0].split(' ').slice(2).join(' ').trim();
        const periodMatch = cleanedInput.match(/\((\d+)\)/);
        const period = periodMatch ? periodMatch[1] : null;
        return {
            Teacher: teacher,
            Class: className,
            Period: period
        };
    }

    function createProgressBar(gradeContainers) {
        const radius = 50; // Circle radius
        const circumference = 2 * Math.PI * radius; // Circumference of the circle

        for (let gradeContainer of gradeContainers) {
            // Get the percentage value from the second child
            const classPctText = gradeContainer.children[1].textContent;
            const classPct = parseFloat(classPctText) || 0;

            const classGradeText = gradeContainer.children[0].textContent;

            // Calculate the strokeDashoffset
            const offset = circumference - ((classPct / 100) * circumference);

            // Create a new progress container for this grade container
            const progressContainer = document.createElement('div');
            progressContainer.classList.add('circular-progress');
            progressContainer.setAttribute('data-bind', 'visible: showAssignmentPct');

            // Update the inner HTML with the correct progress
            progressContainer.innerHTML = `
                <svg class="progress-ring" width="120" height="120">
                    <circle
                        class="progress-ring__circle"
                        cx="60" cy="60" r="${radius}"
                        stroke="blue" fill="transparent"
                        stroke-width="10"
                        stroke-dasharray="${circumference} ${circumference}"
                        stroke-dashoffset="${offset}"
                    ></circle>
                </svg>
                <div class="progress-text-title">${classGradeText}</div>
                <div class="progress-text">${classPct}%</div>
            `;

            gradeContainer.innerHTML = '';
            gradeContainer.appendChild(progressContainer.cloneNode(true));

            let className = 'Unknown Class'
            let teacherName = 'Unknown Teacher'
            let period = '0'

            const classNames = document.getElementsByClassName('class-name');
            if (classNames) {
              for (let classNameElement of classNames) {
                const classInfo = parseClassInfo(classNameElement.textContent);
                className = classInfo.Class;
                teacherName = classInfo.Teacher;
                period = classInfo.Period;
                classNameElement.remove();
              };
            };

            const classInfoCard = document.createElement('div');
            classInfoCard.classList.add('course-info-card');
            classInfoCard.classList.add('course-info-card-title');
            classInfoCard.innerHTML = `
            <p style="font-size: 2em; color: #b380ff; font-weight: bold; text-align: left;" >${className}</p>
            <p style="font-size: 1.5em; color: #b380ff; font-weight: bold; text-align: left;" >${teacherName}</p>
            <p style="font-size: 1.2em; color: #b380ff; font-weight: bold; text-align: left;" >Period ${period}</p>
            `;
            gradeContainer.parentNode.parentNode.parentNode.parentNode.parentNode.insertBefore(classInfoCard, gradeContainer.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[2]);
        };
    };

    // Wait for the document to fully load
    window.addEventListener('load', function() {
        // Remove footer element by ID
        const footer = document.getElementById('ctl00_ctl00_PXPFooter');
        if (footer) {
            footer.remove();
        };

        const footer_alt = document.getElementById('ctl00_PXPFooter');
        if (footer_alt) {
          footer_alt.remove();
        };

        const student_info = document.getElementById('ctl00_ctl00_MainContent_StudentSelector');
        if (student_info) {
          student_info.remove();
        };

        const districtName = document.getElementById('DistrictName');
        if (districtName) {
          districtName.parentNode.setAttribute("class", "pull-left hide-for-print greeting-container");
        };

        waitForCSS();

        const courseHistoryContent = document.getElementById('ctl00_ctl00_MainContent_PXPMainContent_CourseHistoryContent');
        if (courseHistoryContent) {
          const flexBox = courseHistoryContent.children[0];
          if (flexBox) {
            for (const child of flexBox.children) {
              const text = child.textContent;
              if (text) {
                if (text.includes("Test Requirements")) {
                  child.remove();
                }
                if (text.includes("Student Course History")) {
                  child.remove();
                }
              };
            };
          };
        };

        const gradebookContent = document.getElementById('ctl00_ctl00_MainContent_PXPMainContent_repSchoolClasses_ctl00_ctl00_SchoolClassesPanel');
        if (gradebookContent) {
          const buttons = gradebookContent.querySelectorAll('button[data-action="GB.LoadControl"]');
          console.log(buttons);
          if (buttons.length > 0) {
            buttons.forEach(button => {
              button.onclick = function() {
                waitForElement("grade-container", createProgressBar);
              };
            });
          }
        }

        function parseGreeting(greeting) {
            const regex = /Good .*?, (.*?), \d{1,2}\/\d{1,2}\/\d{4}/;
            const match = greeting.match(regex);
            if (match && match[1]) {
                const fullName = match[1];
                const firstName = fullName.split(' ')[0];
                return `Welcome back ${firstName}!`;
            }
            return 'Invalid greeting format.';
        }

        const greeting = document.getElementById('Greeting');
        if (greeting) {
          greeting.textContent = parseGreeting(greeting.textContent);
        }

        const globalStyle = document.createElement('style');
        globalStyle.innerHTML = `
        /* Base Colors */
            :root {
                /* Primary Colors */
                --st-color-red: #ff4d4d !important;
                --st-color-green: #33cc33 !important;
                --st-color-blue: #4d4dff !important;
                --st-color-cyan: #70c4d9 !important;
                --st-color-orange: #ff8c4d !important;
                --st-color-violet: #a64dff !important;
                --st-color-red-fg: #ff6666 !important;
                --st-color-green-fg: #66ff66 !important;
                --st-color-blue-fg: #a3a3ff !important;
                --st-color-cyan-fg: #a1d9d9 !important;
                --st-color-orange-fg: #ffb380 !important;

                /* Headings */
                --st-heading-blue-bg: #333366 !important;
                --st-heading-blue-fg: #d1b3ff !important;
                --st-heading-red-bg: #661a1a !important;
                --st-heading-red-fg: #ffcccc !important;
                --st-heading-green-bg: #194d19 !important;
                --st-heading-green-fg: #b3ffb3 !important;
                --st-heading-violet-bg: #4d194d !important;
                --st-heading-violet-fg: #f2ccff !important;
                --st-heading-tools-bg: #444 !important;
                --st-heading-tools-fg: #bbb !important;

                /* Base Content */
                --st-color-bg: #000 !important;
                --st-color-fg: #e6e6e6 !important;
                --st-color-link-fg: #b380ff !important;
                --st-color-link-hover-fg: #d1b3ff !important;
                --st-color-dim-fg: #999 !important;

                /* Panels and Boxes */
                --st-color-panel-bg: #111 !important;
                --st-color-panel-fg: #ccc !important;
                --st-color-border: #555 !important;
                --st-color-modal-bg: #1a1a1a !important;
                --st-color-modal-fg: #e6e6e6 !important;

                /* Highlights */
                --st-color-selected-item-bg: rgba(102, 51, 153, 0.5) !important;
                --st-color-selected-item-fg: #fff !important;
                --st-color-hover-bg: #333 !important;
                --st-color-hover-fg: #e6e6e6 !important;
                --st-color-active-bg: #4d194d !important;
                --st-color-active-fg: #fff !important;

                /* Form Controls */
                --st-color-input-bg: #222 !important;
                --st-color-input-fg: #d9d9d9 !important;
                --st-color-input-border: #666 !important;

                /* Buttons */
                --st-btn-primary-bg: #7000ff !important;
                --st-btn-primary-fg: #fff !important;
                --st-btn-primary-border: #5200cc !important;
                --st-btn-secondary-bg: #4d4d4d !important;
                --st-btn-secondary-fg: #ddd !important;
                --st-btn-secondary-border: #666 !important;

                /* Alerts */
                --st-alert-error-bg: #661a1a !important;
                --st-alert-error-fg: #ffcccc !important;
                --st-alert-info-bg: #333366 !important;
                --st-alert-info-fg: #ccccff !important;
                --st-alert-success-bg: #194d19 !important;
                --st-alert-success-fg: #b3ffb3 !important;

                /* Table */
                --st-grid-heading-bg: #333 !important;
                --st-grid-heading-fg: #b380ff !important;
                --st-grid-border: #555 !important;
                --st-color-row-selected-bg: #4d194d !important;
                --st-color-row-selected-fg: #fff !important;
            }

            /* Emergency Response and Additional Styles */
            :root {
                --emg-header-bg: #7000ff !important;
                --emg-header-fg: #fff !important;
                --emg-header-background: linear-gradient(to bottom, #5200cc, #7000ff) !important;
            }
        `

        // Create a style element
        const style = document.createElement('style');
        style.innerHTML = `
            .list-group-item {
              position: relative;
              display: block;
              padding: 10px !important;
              margin-bottom: -1px;
              background-color: #000;
              border: none #000;
              border-radius: 8px !important;
              padding-bottom: 7px !important;
              padding-top: 7px !important;
            }
            .list-group-item.active {
              background-color: #b380ff4d !important;
              border-radius: 8px !important;
              padding-bottom: 5px !important;
              padding-top: 5px !important;
            }
            .flexbox {
              background-color: #000 !important;
              border: none !important;
            }
            .gb-class-header {
              border: none !important;
            }
            .gb-class-row {
              border: none !important;
            }
            .title {
              color: #b380ff;
            }
            #ctl00_ctl00_MainContent_PXPHeader {
              padding-top: 45px !important;
            }
            body .pxp-navbar a,
            body .pxp-navbar a:visited {
              border: none #000 !important;
              padding: 8px !important;
              border-radius: 8px !important;
              margin-top: 10px;
            }
            .pxp-navbar li:hover a, .pxp-navbar li a:hover, .pxp-navbar li a.visit-scheduled {
              background-color: #d1b3ff;
            }
            .tab-content {
              margin-top: 50px !important;
            }
            #DistrictName {
              color: #d1b3ff !important;
              position: static !important;
            }
            .greeting-container {
              margin-bottom: 20px !important;
            }
            .table thead > tr > th, .table > thead > tr > th, .table > thead > tr > td, .table > tbody > tr > th {
              background-color: #000 !important;
            }
            .table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th {
              border: none !important;
            }
            .title {
              color: #d1b3ff !important;
            }
            .bar {
              border-radius: 8px !important;
              overflow: hidden !important;
              border: none !important;
            }
            .pct-completed {
              color: #b380ff !important;
            }
            .pxp-summary, .pxp-summary-details > div {
              padding: 0px !important;
            }
            .table-striped>tbody>tr:nth-of-type(odd) {
              background: #000 !important;
            }
            .pxp-summary-container > .pxp-summary-details .dismiss-btn {
              background: #000 !important;
            }
            #maincontent h1 {
              border: none !important;
              color: #b380ff !important;
            }
            h1 .class-of {
              color: #9954ff !important;
            }
            .pxp-summary-chart {
              width: 100% !important;
            }
            .pxp-course-content .items-total {
              background-color: #b380ff4d !important;
              border-radius: 16px !important;
            }
            .pxp-course-content .group-text-container {
              background-color: #b380ff4d !important;
              border-radius: 16px !important;
            }
            .pxp-course-content .connector {
              background-color: #b380ff4d !important;
            }
            .pxp-course-grade-card .grade-container h3 {
              color: #9954ff !important;
            }
            .pxp-course-cards .course-info-card {
              border: none !important;
              background: #000 !important;
            }
            .dx-toolbar {
              background: #000 !important;
            }
            .pxp-course-content .connector-wrapper {
              border-top: solid 2px #b380ff4d !important;
              border-bottom: solid 2px #b380ff4d !important;
            }
            .photo-container {
              display: none !important;
            }
            .pxp-course-content .item-text-container {
              border: none !important;
              background-color: #b380ff26 !important;
              border-radius: 16px !important;
              padding: 10px !important;
              padding-bottom: 6px !important;
            }
            .pxp-course-content .item-text-container:hover, .pxp-course-content .item-text-container:active {
              /*box-shadow: 0 0 15px #b380ff4d !important;*/
              box-shadow: none !important;
            }
            .pxp-course-content .col-md-12 {
              display: none !important;
            }
            .pxp-course-content .item-text-special {
              color: #b380ff !important;
            }
            .pxp-course-content .larger-text {
              color: #b380ff !important;
            }
            .pxp-course-content .item-text-small {
              color: #b380ffB3 !important;
            }
            .circular-progress {
                position: relative;
                display: inline-block;
                width: 120px;
                height: 120px;
            }
            .progress-ring {
                transform: rotate(-90deg);
            }
            .progress-ring__circle {
                fill: none;
                stroke: #8a2be2;
                stroke-linecap: round;
                transition: stroke-dashoffset 0.35s;
                stroke-width: 10;
            }
            .progress-text-title {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 34px !important;
                color: #8a2be2;
                font-weight: bold;
            }
            .progress-text {
                position: absolute;
                top: 75%;
                left: 50%;
                transform: translate(-50%, -75%);
                font-size: 1.5em;
                color: #8a2be2;
                font-weight: bold;
            }
            .pxp-course-cards .course-info-card-title {
              width: 300px !important;
            }
            #maincontent .breadcrumb-bottom {
              border: none !important;
            }
            .dx-button-mode-contained {
              border: none !important;
              border-radius: 8px !important;
              background: #181818 !important;
              color: #fff !important;
            }
            .dx-texteditor.dx-editor-outlined {
              border: none !important;
              border-radius: 8px !important;
              background: #181818 !important;
              color: #fff !important;
            }
            .expander {
              display: none !important;
            }
            .form-group {

            }
            .panel-heading {
              display: none !important;
            }
            .panel-footer {
              display: none !important;
            }
            .greeting-container {
              background-color: #b380ff26 !important;
              border-radius: 16px !important;
              padding: 20px;
              width: 100%;
            }
            #ctl00_ctl00_MainContent_PXPHeader .greeting-container {
              background-color: transparent !important;
            }
            #ctl00_ctl00_MainContent_PXPHeader #DistrictName {
              text-align: left !important;
            }
            #DistrictName {
              text-align: center !important;
            }
            body h1 {
              border: none !important;
            }
            .dx-datagrid {
              background-color: #000 !important;
            }
            .dx-datagrid .dx-row-alt > td, .dx-datagrid .dx-row-alt > tr > td {
              background-color: #000 !important;
            }
            .dx-datagrid-headers .dx-datagrid-table .dx-row > tr {
              border: none !important;
            }
            .dx-datagrid .dx-column-lines > td {
              border: none !important;
            }
            .dx-datagrid-headers {
              color: #b380ffD9 !important;
              border: none !important;
            }
            .dx-datagrid-header-panel {
              border: none !important;
            }
            .dx-datagrid-total-footer {
              border: none !important;
            }
            .dx-datagrid-borders .dx-datagrid-rowsview, .dx-datagrid-headers + .dx-datagrid-rowsview, .dx-datagrid-rowsview.dx-datagrid-after-headers {
              border: none !important;
            }
            .dx-datagrid .dx-row > td {
              color: #b380ffD9 !important;
            }
            .dx-datagrid-summary-item {
              color: #b380ffD9 !important;
            }
            body[data-theme] .panel-box, body[data-theme] .panel {
              background-color: #000 !important;
            }
            .detail-content #current-grade {
              background-color: #b380ff26 !important;
            }
            .mark, mark {
              background-color: transparent !important;
            }
        `;

        // Append the style to the head
        document.head.appendChild(style);
        document.head.appendChild(globalStyle);

        const iconMap = {
          "Home": GM_getResourceURL("homeIcon"),
          "Synergy Mail": GM_getResourceURL("mailIcon"),
          "Calendar": GM_getResourceURL("calendarIcon"),
          "Attendance": GM_getResourceURL("attendanceIcon"),
          "Class Schedule": GM_getResourceURL("scheduleIcon"),
          "Course History": GM_getResourceURL("courseHistoryIcon"),
          "Grade Book": GM_getResourceURL("gradebookIcon"),
          "MTSS": GM_getResourceURL("mtssIcon"),
          "Report Card": GM_getResourceURL("reportCardIcon"),
          "School Information": GM_getResourceURL("schoolInfoIcon"),
          "Student Info": GM_getResourceURL("studentInfoIcon"),
          "Documents": GM_getResourceURL("documentsIcon")
      };

      // Replace icons in the menu
      document.querySelectorAll('.list-group-item').forEach(item => {
          const desc = item.getAttribute('data-desc');
          if (iconMap[desc]) {
              let iconElement = item.querySelector('img.icon');
              let iconGSElement = item.querySelector('img.icon-gs');
              if (iconElement) {
                iconElement.src = iconMap[desc];
              };
              if (iconGSElement) {
                iconGSElement.src = iconMap[desc];
              };
          };
          if (desc == "Course History") {
            let label = item.querySelector('span.desc');
            if (label) {
              label.textContent = "Graduation"
            }
          };
      });
    });
})();
