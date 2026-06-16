export const drag = (ev) => {
  ev.dataTransfer.setData("ip", ev.target.dataset.ip);
  ev.dataTransfer.setData("camera_name", ev.target.dataset.name);
};

export const allowDrop = (ev) => {
  ev.preventDefault();
};

export const drop = (ev, props) => {
  ev.preventDefault();
  const { frames_detections } = props;

  let ip = ev.dataTransfer.getData("ip") || "/assets/stream.png";
  let camera_name = ev.dataTransfer.getData("camera_name");

  ev.currentTarget.children[0].firstChild.textContent = camera_name; // Set camera name to span tag inside of top frame div

  ev.currentTarget.children[0].style.display = "block"; // Show the top frame div
  ev.currentTarget.children[1].firstChild.src = ip; // Set the Live feed url

  // maintaining frames ip and frames id on tab change in tab_data props.
  let frameId = ev.currentTarget.children[1].firstChild.id;

  let frames_obj = {
    frame_ip: ip,
    frame_id: frameId,
  };
  if (frames_detections.length) {
    let idx = frames_detections.findIndex((rec) => rec.frame_id === frameId);
    if (idx !== -1) {
      frames_detections[idx].frame_ip = ip;
    } else {
      frames_detections.push(frames_obj);
    }
  } else {
    frames_detections.push(frames_obj);
  }

  if (ip) {
    let url = new URL(ip);
    const urlSearchParams = new URLSearchParams(url.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    ev.currentTarget.children[1].firstChild.setAttribute("data-ip", params.ip);
  }

  // ev.currentTarget.children[2].style.display = "block"; // Show the bottom frame div
};
