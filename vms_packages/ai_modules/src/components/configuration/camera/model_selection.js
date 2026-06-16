/* eslint-disable array-callback-return */
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import SingleSelect from "../../../common/select";
import * as data from "../../../common/configuration/camerasobj.json";
import { makeStyles } from "@mui/styles";
import ModelsService from "../../../services/models";
import _ from 'lodash';

const useStyles = makeStyles((theme) => ({
  root: {},
  radioGrpFrmCtrl: {
    color: theme.palette.text.primary,
    "& .MuiRadio-root": {
      color: theme.palette.text.primary,
    },
  },
  radioGrp: {
    color: theme.palette.text.primary,
  },
  formLbl: {
    color: theme.palette.text.primary,
  },
}));

const ModelSelection = (props) => {
  const classes = useStyles();

  // let clone_obj = Object.assign({}, props.obj);
  let clone_obj = Object.assign({}, props.objList[props.selectedIndex]);
  const modelData = props.modelsData;
  const modelGroupData = props.modelsGroup;
  // eslint-disable-next-line no-unused-vars
  const [model_name, setModel] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [model_group_name, setModelGroup] = useState(null);
  const [value, setValue] = React.useState("model_name");
  const [selectedVal, setSelectVal] = React.useState(null);
  const [models, setModels] = React.useState([]);
  const { model_selections } = data?.default;

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    getModels();
  }, []);

  useEffect(() => {
    // console.log('props starting', props);
    let clone_obj = Object.assign({}, props.objList[props.selectedIndex]);
    const { model_settings } = clone_obj;
  
    setModel(model_settings["model_id"] !== "" ? model_settings["model_id"] : null);
    setModelGroup(model_settings["model_group_id"] !== "" ? model_settings["model_group_id"] : null);
    setValue(
      model_settings["model_id"] !== "" ? "model_name" :
      model_settings["model_group_id"] !== "" ? "model_group_name" :
      null
    );
    setSelectVal(
      model_settings["model_id"] !== "" ? model_settings["model_id"] :
      model_settings["model_group_id"] !== "" ? model_settings["model_group_id"] :
      null
    );
    // console.log('values for model_name, model_group_name, value, selectedVal, models', model_name, model_group_name, value, selectedVal, models);
    // console.log('clone starting', clone_obj);
  }, [props.selectedIndex, props.objList]);

  // useEffect(() => {
  //   if (clone_obj && clone_obj.model_settings["model_id"] && !value) {
  //     setValue("model_name");
  //   } else if (
  //     clone_obj &&
  //     clone_obj.model_settings["model_group_id"] &&
  //     !value
  //   ) {
  //     setValue("model_group_name");
  //   }
  //   getModels();
  // }, []);

  // useEffect(() => {
  //   if(clone_obj)
  //   {
  //     const obj = {type: 'select', label: 'Model', name: 'model_name', key: 'model_id', id: "model_select_id",
  //     key: "model_id",
  //     label: "Model",
  //     name: "model_name",
  //     options: [],
  //     type: "select"}
  //     setModelIptParams(clone_obj.model_settings["model_name"], obj)
  //   }
  // }, [selectedVal]);

  const getModels = () => {
    ModelsService.getModels()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          setModels(data);
          if (clone_obj.rule_settings && clone_obj.rule_settings.length) {
            clone_obj.rule_settings.map(rec => {
              let idx = data.findIndex((mdl) => mdl.id === rec.model_id);
              if (idx !== -1) {
                rec.model_name = data[idx].label
              }
              let selMdlId = data.findIndex((mdl) => mdl.id === clone_obj.model_settings["model_id"]);
              if (!rec.rules) {
                rec.rules = data[selMdlId].input_params || null;
              } else {
                if (data[selMdlId].input_params && data[selMdlId].input_params.length) {
                  const rules = rec.rules.length ? rec.rules : [rec.rules];

                  data[selMdlId].input_params.map(mdlRule => {
                    if (rules.findIndex(ip => ip.key === mdlRule.key) === -1) {
                      rules.push(mdlRule);
                    }
                  });
                }
              }
            });
          }

          if (clone_obj && clone_obj.model_settings["model_id"]) {
            const options = [
              {
                id: clone_obj.model_settings["model_id"],
                label: clone_obj.model_settings["model_name"],
                key: clone_obj.model_settings["model_key"]
              },
            ];
            clone_obj.model_settings["model_ids"] = [clone_obj.model_settings["model_id"]]
            if (typeof props.setSelectedModels === "function") {
              props.setSelectedModels(props.selectedIndex, options);
            }
          } else if (clone_obj && clone_obj.model_settings["model_group_id"]) {
            const options = [];
            clone_obj.model_settings["models_group"].map((mid, mIdx) => {
              let idx = data.findIndex((rec) => rec.id === mid);
              if (idx !== -1) {
                let obj = {
                  id: mid,
                  label: data[idx].label,
                  key: data[mIdx].key
                };
                options.push(obj);
              }
            });
            if (typeof props.setSelectedModels === "function") {
              props.setSelectedModels(props.selectedIndex, options);
            }
          }
          // console.log('into model selection', clone_obj);
          props.setData(clone_obj);
          var newObjList = [...props.objList];
          newObjList[props.selectedIndex] = clone_obj;
          props.setObjList(newObjList);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log("error response", err);
        } else if (err.request) {
          console.log("error request", err);
        } else {
          console.log("error", err);
        }
      });
  };

  const setModelIptParams = (val, rec) => {
    if (val.input_params && val.input_params.length) {
      let obj = {
        camera_id: clone_obj.camera_id,
        model_id: val.id,
        model_name: val.model_name,
        rules: val.input_params,
      };
      clone_obj.rule_settings = [];
      clone_obj.rule_settings.push(obj);
      clone_obj.model_settings["model_input_params"] =
        val.input_params;
    } else {
      let obj = {
        camera_id: clone_obj.camera_id,
        model_id: val.id,
        model_name: val.model_name,
        rules: [],
      };
      clone_obj.rule_settings = [];
      clone_obj.rule_settings.push(obj);
    }
    clone_obj.model_settings[rec.key] = parseInt(val.id);
    clone_obj.model_settings[rec.name] = val.label;
    clone_obj.model_settings["model_ids"] = [parseInt(val.id)];
    if (
      clone_obj.model_settings["model_group_name"] ||
      clone_obj.model_settings["model_group_id"]
    ) {
      clone_obj.model_settings["model_group_name"] = null;
      clone_obj.model_settings["model_group_id"] = null;
    }
    props.setData(clone_obj);
    var newObjList = [...props.objList];
    newObjList[props.selectedIndex] = clone_obj;
    props.setObjList(newObjList);
    setModel(val.id);
    setModelGroup(null);
    const options = [
      {
        id: parseInt(val.id),
        label: val.label,
        key: val.key,
      },
    ];
    if (typeof props.setSelectedModels === "function") {
      props.setSelectedModels(props.selectedIndex, options);
    }
  }

  const setModelGroupIptParams = (val, rec) => {
    const options = [];
    if (
      val.model_ids &&
      val.model_ids.length &&
      models.length
    ) {
      clone_obj.rule_settings = [];
      val.model_ids.map((mid, mIdx) => {
        const modelRec = val.models.filter(rec => rec.model_id === mid);
        if (modelRec.length) {
          let obj = {
            id: modelRec[0].model_id,
            label: modelRec[0].model_name,
            key: modelRec[0].model_name
              .replace(/\s/g, "_")
              .toLowerCase(),
          };
          options.push(obj);
        }
        let idx = models.findIndex((rec) => rec.id === mid);
        if (idx !== -1) {
          if (
            models[idx].input_params &&
            models[idx].input_params.length
          ) {
            const obj = {
              camera_id: clone_obj.camera_id,
              model_id: mid,
              model_name: models[idx].model_name,
              rules: models[idx].input_params,
            };
            clone_obj.rule_settings.push(obj);
          } else {
            const obj = {
              camera_id: clone_obj.camera_id,
              model_id: mid,
              model_name: models[idx].model_name,
              rules: [],
            };
            clone_obj.rule_settings.push(obj);
          }
        }
      });
      if (typeof props.setSelectedModels === "function") {
        props.setSelectedModels(props.selectedIndex, options);
      }
    }
    clone_obj.model_settings[rec.key] = parseInt(val.id);
    clone_obj.model_settings[rec.name] = val.label;
    clone_obj.model_settings["model_ids"] = val.model_ids;
    if (
      clone_obj.model_settings["model_name"] ||
      clone_obj.model_settings["model_id"]
    ) {
      clone_obj.model_settings["model_name"] = null;
      clone_obj.model_settings["model_id"] = null;
    }
    props.setData(clone_obj);
    var newObjList = [...props.objList];
    newObjList[props.selectedIndex] = clone_obj;
    props.setObjList(newObjList);
    setModelGroup(val.id);
    setModel(null);
  }


    const getStepContent = (type) =>
    model_selections.map((rec, i) => {
      return rec && 
        rec.type === "radio_group" &&
        type === "radio_group" &&
        rec.is_form_control ? (
        <Fragment key={`model-radio-${i + 1}`}>
          <RadioGroup
            row
            aria-label={rec.label}
            value={value}
            key={`model-radio-${i + 1}`}
            onChange={handleChange}
            name={rec.name}
            className={classes.radioGrp}
          >
            {/* {rec.radio_options.map((childRec, recIdx) => (
              <FormControlLabel
                value={childRec.value}
                key={`model-radio-label-${recIdx + 1}`}
                control={<Radio />}
                label={childRec.label}
                className={classes.radioGrpFrmCtrl}
              />
            ))} */}
          </RadioGroup>
        </Fragment>
      ) : rec && rec.type === "select" && type === "select" ? (
        <Fragment key={`model-select-${i + 1}`}>
          <Grid item>
            <SingleSelect
              width={270}
              label={rec.label}
              key={`model-radio-select-${i + 1}`}
              propKey="id_label"
              options={rec.name === "model_name" ? modelData : modelGroupData}
              addDefault={false}
              camConfig={true}
              selectedVal={
                (rec.name === "model_name" ? model_name : model_group_name) ||
                clone_obj.model_settings[rec.key]
              }
              // disabled={value !== rec.name}
              setSelectVal={(val) => {
                console.log(val)
                if (rec.name === "model_name") {
                  if (typeof props.setData == "function") {
                    console.log(val, rec)
                    setModelIptParams(val, rec);
                  }
                } else {
                  if (typeof props.setData == "function") {
                    setModelGroupIptParams(val, rec);
                  }
                }
              }}
            />
          </Grid>
        </Fragment>
      ) : null;
    });

  return (
    <FormControl component="fieldset">
      <FormLabel className={classes.formLbl} component="legend">
        Model Type
      </FormLabel>
      {getStepContent("radio_group")}
      <Grid sx={{ flexGrow: 1 }} justifyContent="center" container spacing={2}>
        {getStepContent("select")}
      </Grid>
    </FormControl>
  );
};

export default ModelSelection;
