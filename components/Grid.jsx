import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import DataEditor, {
  DataEditorContainer,
  GridCellKind,
} from "@glideapps/glide-data-grid";
import { ThemeProvider, useTheme } from "styled-components";
import { marked } from "marked";
import { getBuilderTheme } from "./GridStyles";

export default function Sheet({
  columns,
  source,
  error,
  isValidating,
  cellWasDoubleClicked,
  defaultSortColumn,
  headerHeight = 32,
  rowHeight = 32,
  rowMarkerWidth = 30,
}) {
  const showLoading = isValidating && (!source || !source.length);

  const wrapper = useRef(null);

  const [lastClickedCell, setLastClickedCell] = useState(null);
  const [sortedColumn, setSortedColumn] = useState(defaultSortColumn);

  const sortedSource = useMemo(() => {
    return source.sort((a, b) => {
      if (isNaN(a[sortedColumn])) {
        return -1;
      }
      if (isNaN(b[sortedColumn])) {
        return 1;
      }

      if (a[sortedColumn] > b[sortedColumn]) {
        return -1;
      } else {
        return 1;
      }
    });
  }, [sortedColumn, source]);

  const [dimensions, setDimensions] = useState({
    height: 300,
    width: 400,
  });

  const [visibleRange, setVisibleRange] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const calcHeight = () => {
    if (wrapper?.current) {
      const rect = wrapper.current.getBoundingClientRect();
      setDimensions({
        height: rect.height,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", calcHeight);
  }, []);

  useEffect(() => {
    calcHeight();
  }, [wrapper, wrapper?.current]);

  function getData([col, row]) {
    const ship = sortedSource[row];

    const column = columns[col];

    if (!column) {
      throw new Error("Column not found");
    }

    return {
      kind: column.kind || GridCellKind.Text,
      displayData: column.render
        ? column.render(ship[column.prop])
        : `${ship[column.prop] || ""}`,
      data: ship[column.prop],
      allowOverlay: false,
      lastUpdated: ship.lastUpdated,
      themeOverride: column.themeOverride
        ? column.themeOverride(ship[column.prop], ship)
        : null,
    };
  }

  const theme = useTheme();
  const mergedTheme = useMemo(() => {
    return { ...getBuilderTheme(), ...theme };
  }, [theme]);

  return (
    <ThemeProvider theme={mergedTheme}>
      <div
        className={`h-full w-full border-2 border-opacity-70 ${
          isValidating
            ? "border-yellow-500"
            : error
            ? "border-red-500"
            : "border-gray-800"
        } transition-all duration-500 box-border`}
        ref={wrapper}
      >
        <DataEditorContainer
          width={dimensions.width - 4}
          height={dimensions.height - 4}
          onCopy={(event) => {
            console.log(`copy`, event);
          }}
          onCopyCapture={(event) => {
            console.log(`copyCapture`, event);
          }}
        >
          <DataEditor
            className="scroller"
            getCellContent={getData}
            columns={columns}
            rows={showLoading ? 0 : sortedSource.length}
            rowHeight={rowHeight}
            onHeaderClicked={(column) => {
              setSortedColumn(columns[column].prop);
            }}
            onCellClicked={(cell) => {
              if (
                lastClickedCell &&
                lastClickedCell[1] == cell[1] &&
                lastClickedCell[0] == cell[0]
              ) {
                const row = sortedSource[cell[1]];
                cellWasDoubleClicked(row);
              } else {
                setLastClickedCell(cell);
              }
            }}
            // rowMarkers={"number"}
            // rowMarkerWidth={rowMarkerWidth}
            headerHeight={headerHeight}
            onVisibleRegionChanged={(rect) => {
              setVisibleRange(rect);
            }}
          />
        </DataEditorContainer>
      </div>
    </ThemeProvider>
  );
}
