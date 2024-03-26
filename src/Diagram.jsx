// import {
//   BpmnPropertiesPanelModule,
//   BpmnPropertiesProviderModule,
//   CamundaPlatformPropertiesProviderModule,
// } from "bpmn-js-properties-panel";

// import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
// import "bpmn-js-properties-panel/dist/assets/properties-panel.css";
// import "bpmn-js-properties-panel/dist/assets/element-templates.css";

// import starterBpmn from "./assets/diagram.bpmn";

import { xmlToNeo4j } from "bpmn-to-neo4j-m";

import { useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";

import { starterBpmn } from "./assets/starter_bpmn.jsx";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "./index.css";

import gridModule from "diagram-js-grid";
import { TbZoomReset, TbZoomIn, TbZoomOut } from "react-icons/tb";
import { HiMiniFolderOpen } from "react-icons/hi2";
import { FaFileExport } from "react-icons/fa6";
import { PiGraph } from "react-icons/pi";
import { IoMdAddCircle } from "react-icons/io";

import DrawerComponent from "./components/DrawerComponent.jsx";

function Diagram() {
  const container = useRef(null);
  const [modeler, setModeler] = useState(null);
  const [bpmn, setBpmn] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);

  const inpRef = useRef(null);

  let modelerInstance = null;

  useEffect(() => {
    if (modelerInstance) return;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    modelerInstance = new Modeler({
      container: container.current,
      additionalModules: [gridModule],
    });
    modelerInstance.importXML(starterBpmn).then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      modelerInstance.get("canvas").zoom("fit-viewport");
    });

    setModeler(modelerInstance);

    return () => {
      modeler?.destroy();
    };
  }, []);

  // file upload end

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const xml = e.target.result;

      modeler.importXML(xml).then(({ warnings }) => {
        if (warnings.length) {
          console.warn(warnings);
        }

        modeler.get("canvas").zoom("fit-viewport");
      });
    };

    reader.readAsText(file);
  };

  const handleDiagramView = () => {
    setIsOpen((prev) => !prev);
  };

  const handleExport = () => {
    modeler.saveXML({ format: true }).then(({ xml, error }) => {
      if (error) {
        console.error(error);
        return;
      }

      console.log("UPDATE XML:", xml);

      setBpmn(xml);

      xmlToNeo4j(
        xml,
        import.meta.env.VITE_NEO4J_URL,
        import.meta.env.VITE_NEO4J_USERNAME,
        import.meta.env.VITE_NEO4J_PASSWORD
      );
    });
  };

  const handleNewDiagram = () => {
    modeler.importXML(starterBpmn).then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      modeler.get("canvas").zoom("fit-viewport");
    });
  };

  const zoomIn = () => {
    const newZoomLevel = zoomLevel + 0.1; // Increase the zoom level by 10%
    setZoomLevel(newZoomLevel); // Update the zoom level state
    modeler.get("canvas").zoom(newZoomLevel); // Zoom the canvas to the new zoom level
  };

  const zoomOut = () => {
    const newZoomLevel = zoomLevel - 0.1; // Decrease the zoom level by 10%
    setZoomLevel(newZoomLevel); // Update the zoom level state
    modeler.get("canvas").zoom(newZoomLevel); // Zoom the canvas to the new zoom level
  };

  const zoomReset = () => {
    setZoomLevel(1); // Reset the zoom level state to 1
    modeler.get("canvas").zoom("fit-viewport"); // Zoom the canvas to fit the viewport
  };

  return (
    <div>
      <div className="modeler-parent">
        <div
          id="modeler-container"
          ref={container}
          style={{ marginLeft: "-10px" }}
        ></div>
        <span
          style={{
            display: "flex",
            justifyContent: "flex-start",
            padding: 4,
            gap: 10,
            position: "absolute",
            bottom: 10,
            left: 10,
          }}
        >
          <input
            type="file"
            ref={inpRef}
            onChange={handleImport}
            style={{
              position: "absolute",
              bottom: 20,
              left: 180,
              display: "none",
            }}
          />
          <button
            onClick={() => inpRef.current.click()}
            // style={{ position: "absolute", bottom: 10, left: 180 }}
            title="open BPMN diagram from local file system"
          >
            <HiMiniFolderOpen size={20} />
          </button>
          <button title="create new BPMN diagram" onClick={handleNewDiagram}>
            <IoMdAddCircle size={20} />
          </button>
          <button
            onClick={handleExport}
            // style={{ position: "absolute", bottom: 10, left: 10 }}
            title="export BPMN diagram to Neo4j database"
          >
            <FaFileExport size={20} />
          </button>
          <button
            disabled={!bpmn}
            onClick={handleDiagramView}
            // style={{ position: "absolute", bottom: 10, left: 350 }}
            title="visualise the neo4j diagram"
          >
            <PiGraph size={20} />
          </button>
        </span>
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            // width: "10vw",
            justifyContent: "flex-end",
            position: "absolute",
            bottom: "3em",
            right: "2px",
            padding: "1em",
            gap: "1px",
          }}
        >
          <button onClick={zoomReset} title="reset zoom">
            <TbZoomReset size={20} />
          </button>
          <button onClick={zoomIn} title="zoom in">
            <TbZoomIn size={20} />
          </button>
          <button onClick={zoomOut} title="zoom out">
            <TbZoomOut size={20} />
          </button>
        </span>
      </div>

      <DrawerComponent isOpen={isOpen} onClose={handleDiagramView} />
    </div>
  );
}

export default Diagram;
