import { useEffect, useState } from "react";

const EventSourceCallback = (props) => {
  const [evtSource, setEventSource] = useState(null);
  const [evtSourceUrl, setEventSourceUrl] = useState(null);

  const initEvtStream = () => {
    const evtSrc = new EventSource(props.url);
    if (evtSrc) {
      setEventSource(evtSrc);
    }
  };

  useEffect(() => {
    if (props.url) {
      if (evtSourceUrl && props.url !== evtSourceUrl && props.isStream) {
        return setCloseStream();
      }
      if (!evtSource || (evtSource && evtSource.url !== props.url)) {
        return initEvtStream();
      }
    }
  }, [props.url]);

  useEffect(() => {
    if (evtSource) {
      getStream();
    }
  }, [evtSource]);

  const getStream = () => {
    if (evtSource) {
      setEventSourceUrl(evtSource.url);
      /* This will listen only for events
       * similar to the following:
       *
       * event: notice
       * data: useful data
       * id: someid
       *
       */
      evtSource.addEventListener("notice", function (e) {
        console.log("notice", e.data);
      });

      /* Similarly, this will listen for events
       * with the field `event: update`
       */
      evtSource.addEventListener("update", function (e) {
        console.log("update", e.data);
      });

      /* The event "message" is a special case, as it
       * will capture events without an event field
       * as well as events that have the specific type
       * `event: message` It will not trigger on any
       * other event type.
       */
      evtSource.addEventListener("message", function (e) {
        if (e.data) {
          // console.log('e.data', evtSource.url);
          if (typeof props.getCallbackData === "function") {
            props.getCallbackData(e.data);
          }
          if (typeof props.getAlertsCallbackData === "function") {
            // console.log(e.data);
            let dataStr = "'" + e.data + "'";
            props.getAlertsCallbackData(dataStr);
          }
        }
      });

      evtSource.addEventListener(
        "error",
        function (e) {
          console.log("event source error", e);
          if (e.readyState === EventSource.CLOSED) {
            console.log("Connection CLosed");
            setEventSource(null);
            initEvtStream();
          }
        },
        false
      );
    }
  };

  const setCloseStream = () => {
    if (evtSource) {
      evtSource.close();
      setEventSource(null);
      setEventSourceUrl(null);
      initEvtStream();
    }
  };

  return null;
};

export default EventSourceCallback;
