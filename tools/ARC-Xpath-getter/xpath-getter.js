"use strict";
// Get Xpaths for ARC
// XML Selenese file
let currentEl,
  parentEl,
  strXML = "",
  strXMLEnd = "</TestCase> \n",
  strXMLStart = "",
  strXMLanalyzeAsset = "",
  strDownloadContent = "",
  ARC_XML_DownloadLink,
  strDownloadContentStart = "",
  strDownloadContentItem = "",
  useIDRefs = true,
  xpathList = "",
  stepTitleDefault = "❌TODO_Component_Title_TBC",
  stepTitle = stepTitleDefault,
  title;
function removeDuplicates() {
  let xpathRefs = xpathList.split("\n");
  let xpathListNoDupes = [];
  for (let i = 0; i < xpathRefs.length; i++) {
    if (xpathListNoDupes.indexOf(xpathRefs[i]) < 0) {
      xpathListNoDupes.push(xpathRefs[i]);
    }
  }
  xpathList = xpathListNoDupes.join("\n");
}

function getXpath(el) {
  let currentEl = el;
  let currentElTagName = el.tagName.toLowerCase();
  let parentEl;
  let parentElTagName = "";
  let xpath = "";
  let index = "";
  let separator = "";
  while (currentEl.parentNode) {
    parentEl = currentEl.parentNode;
    if (parentEl.tagName) {
      parentElTagName = parentEl.tagName.toLowerCase();
      const elementsWithSameTagName = parentEl.querySelectorAll(":scope > " + currentEl.tagName);
      if (elementsWithSameTagName.length > 1) {
        index = "[" + parseInt(Array.from(elementsWithSameTagName).indexOf(currentEl) + 1) + "]";
      } else {
        index = "";
      }
      currentElTagName = currentEl.tagName.toLowerCase();
      let id = currentEl.getAttribute("id");
      if (id && useIDRefs) {
        xpath = '/*[@id="' + id + '"]' + separator + xpath;
      } else {
        xpath = currentElTagName + index + separator + xpath;
      }
      separator = "/";
    }

    currentEl = parentEl;
  }
  if (parentElTagName === "") {
    parentElTagName = currentElTagName;
  }
  xpath = "//" + parentElTagName + index + separator + xpath;

  const xpathSplit = xpath.split("//*");
  if (xpathSplit.length > 1) {
    xpath = xpathSplit[xpathSplit.length - 1];
    xpath = "//*" + xpath;
  }

  return xpath;
}

function getXpathARC_XML() {
  let currentEl;
  let parentEl;
  let infoPanel;
  let hasRun = false;

  const allEls = document.querySelectorAll("*");

  function download(filename, text) {
    const ARC_XML_DownloadLink = document.querySelector("#ARC_XML_DownloadLink");
    ARC_XML_DownloadLink.textContent = "Download the XML file";
    ARC_XML_DownloadLink.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    ARC_XML_DownloadLink.setAttribute("download", filename);
  }

  function addEmptyDownloadLink() {
    const a = document.createElement("a");
    a.setAttribute("id", "ARC_XML_DownloadLink");
    a.addEventListener("click", (e) => {
      buildXMLOutput(location.href);
      e.stopPropagation();
    });
    document.body.appendChild(a);
  }
  function addInfoPanel() {
    infoPanel = document.createElement("div");
    infoPanel.setAttribute("id", "infoPanel");
    infoPanel.setAttribute("role", "status");
    document.body.appendChild(infoPanel);
  }
  function removeAllTheThings() {
    outputPanelForARC.remove();
    document.querySelector("#xpathGetterStyles").remove();
  }

  function buildXMLOutput(loc) {
    strXMLStart = "";

    strXMLStart += '<?xml version="1.0" encoding="UTF-8"?>\n';
    strXMLStart += "<TestCase>\n";
    strXMLStart += " <selenese>\n";
    strXMLStart += "  <command>open</command>\n";
    strXMLStart += "  <target><![CDATA[" + loc + "]]></target>\n";
    strXMLStart += "  <value><![CDATA[]]></value>\n";
    strXMLStart += " </selenese>\n";

    strXMLanalyzeAsset = "";
    const xpathRefs = xpathList.split("\n");
    for (let i = 0; i < xpathRefs.length; i++) {
      if (xpathRefs[i] !== "") {
        strXMLanalyzeAsset += " <selenese>\n";
        strXMLanalyzeAsset += "  <command>analyzeAsset</command>\n";
        const locatorAndTitle = xpathRefs[i].split(" — ");
        const locator = locatorAndTitle[0];
        let title = locatorAndTitle[1];
        if (title === stepTitleDefault) {
          ///nothing entered
          title = "TBC";
        }
        strXMLanalyzeAsset += "  <target><![CDATA[xpath=" + locator + "]]></target>\n";
        strXMLanalyzeAsset += "  <title><![CDATA[" + title + "]]></title>\n";
        strXMLanalyzeAsset += "  <description><![CDATA[Analyze the " + title + " component]]></description>\n";
        strXMLanalyzeAsset += "  <value><![CDATA[]]></value>\n";
        strXMLanalyzeAsset += " </selenese>\n";
      }
    }
    strXML = strXMLStart + strXMLanalyzeAsset + strXMLEnd;
    download("ARC-UserFlow-Steps.xml", strXML);
  }
  function addAppStyles() {
    const xpathGetterStyles = document.createElement("style");
    xpathGetterStyles.setAttribute("id", "xpathGetterStyles");
    xpathGetterStyles.textContent = "#outputPanelForARC button {border:1px solid white;color:white;background:black;} .tempHighlight{outline:4px solid black!important;outline-offset:-4px!important;-webkit-box-shadow: 0px 0px 0px 4px #fff; box-shadow: 0px 0px 0px 4px #fff;}#infoPanel {z-index:10000;font-size:20px;background:rgba(0,0,0,0.8);color:#fff;font-weight:bold;padding:10px;position:fixed;bottom:20px;left:20px;font-family:sans-serif;max-width:45vw;overflow:hidden;} #infoPanel:empty {visibility:hidden;} #infoPanel code {color:lime} #ARC_XML_DownloadLink {position:fixed;bottom:10px;right:10px;background:rgba(41, 98, 24,0.9);color:white;font-weight:bold;padding:10px;font-family:sans-serif;} #ARC_XML_DownloadLink:empty{visibility:hidden}";
    document.head.appendChild(xpathGetterStyles);
  }

  function getNodeHTML(el) {
    const wrap = document.createElement("span");
    wrap.appendChild(el.cloneNode(true));
    const snippet = wrap.innerHTML;
    return snippet;
  }

  function getNodeDetails(el, e) {
    unhighlightElement(el);
    buildXMLOutput(location.href);
  }

  unHighlightAll();
  Array.from(allEls).forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.getAttribute("id") !== "ARC_XML_DownloadLink") {
        e.stopPropagation();
        e.preventDefault();
        xpathList += getXpath(el) + " — " + stepTitleDefault + "\n";
        removeDuplicates();
        getNodeDetails(el, e);
        infoPanel.innerHTML = "Added to list " + getXpath(el) + "<br>[Press 't' to provide a title for this component]";
      }
    });
    el.addEventListener("focus", (e) => {
      indicateCurrentEl(el, e);
    });
    el.addEventListener("mouseover", (e) => {
      indicateCurrentEl(el, e);
    });
    el.addEventListener("mouseout", (e) => {
      unHighlightAll();
    });
    el.addEventListener("blur", (e) => {
      unHighlightAll();
    });
  });

  function unHighlightAll() {
    Array.from(allEls).forEach((el) => {
      unhighlightElement(el);
    });
  }

  function indicateCurrentEl(el, e) {
    currentEl = el;
    e.stopPropagation();
    if (!hasRun) {
      highlightElement(el);
    }
    updateInfoPanel(currentEl);
  }

  function unhighlightElement(el) {
    el.classList.remove("tempHighlight");
  }

  function highlightElement(el) {
    el.classList.add("tempHighlight");
  }

  function updateInfoPanel(el) {
    console.log("👉 " + getXpath(el));
    infoPanel.innerHTML = getXpath(el);
  }

  function stripLastLine() {
    const xpathListArr = xpathList.split("\n");
    xpathList = "";
    for (let i = 0; i < xpathListArr.length - 2; i++) {
      xpathList += xpathListArr[i] + "\n";
    }
  }

  function amendCurrentSelection(title) {
    let newXpath = getXpath(currentEl);
    xpathList += newXpath + " — " + title + "\n";
    console.log("Xpath locators and titles to be used in XML file\n--------------------------------\n" + xpathList);
    buildXMLOutput();
    if (currentEl instanceof Element) {
      currentEl.classList.add("xpathGetterHighlight");
    }
  }

  function checkKeyPresses() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        removeAllTheThings();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentEl.parentNode && currentEl.tagName !== "HTML") {
          unhighlightElement(currentEl);
          parentEl = currentEl.parentNode;
          currentEl = parentEl;
          highlightElement(currentEl);
        }
        updateInfoPanel(currentEl);
        infoPanel.textContent = infoPanel.textContent + " (Press Return to get this element's details)";
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentEl.previousElementSibling) {
          unhighlightElement(currentEl);
          currentEl = currentEl.previousElementSibling;
          indicateCurrentEl(currentEl, e);
        }
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentEl.nextElementSibling) {
          unhighlightElement(currentEl);
          currentEl = currentEl.nextElementSibling;
          indicateCurrentEl(currentEl, e);
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentEl.childNodes.length > 1) {
          unhighlightElement(currentEl);
          let elementNodeFound = false;
          let elementToMoveTo;

          Array.from(currentEl.childNodes).forEach((thisNode) => {
            if (thisNode.nodeType === 1 && !elementNodeFound) {
              elementNodeFound = true;
              elementToMoveTo = thisNode;
            }
          });
          if (elementToMoveTo) {
            currentEl = elementToMoveTo;
            indicateCurrentEl(currentEl, e);
          }
        }
      }
      if (e.key === "x") {
        useIDRefs = !useIDRefs;
        console.log("useIDRefs = ", useIDRefs);
      }

      if (e.key === "t") {
        stepTitle = prompt("Enter a title for this step/component");
        stripLastLine();
        amendCurrentSelection(stepTitle);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        currentEl.click();
      }
    });
  }
  addAppStyles();
  addInfoPanel();
  addEmptyDownloadLink();
  checkKeyPresses();

  alert("Open Dev Tools console (if not already open), then just start clicking on the elements on the page that you want to capture Xpath and references and source code for. A list will appear in the console for you to copy/paste. Note that duplicates are automatically removed.\n\n• To move up a node if your selection is too far down, press the Up arrow key\n• To change the selector type (DOM position or use IDs if present), toggle using the left/right arrow keys");
}
getXpathARC_XML();
