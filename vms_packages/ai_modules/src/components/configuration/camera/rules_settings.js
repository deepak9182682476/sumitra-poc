/* eslint-disable array-callback-return */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
// import * as data from "../../../common/configuration/camerasobj.json";
import { makeStyles } from "@mui/styles";
// import SingleSelect from "../../../common/select";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RulesSettings = (props) => {
  const useStyles = makeStyles((theme) => ({
    iptTxtFldCls: {
      "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
        backgroundColor: "#ffffff45 !important",
      },
      "& .MuiOutlinedInput-root": {
        fontSize: "14px !important",
      },
      "& .MuiSelect-select": {
        color: "#aea256 !important",
      },
    },
    selectFldCls: {
      "& .MuiOutlinedInput-root": {
        fontSize: "14px !important",
      },
    },
    mainContainer: {
      maxHeight: "61vh",
      minHeight: "61vh",
      padding: "0px 16px",
      overflowY: "scroll",
    },
    rulesAcc: {
      marginBottom: '4px',
      "& .MuiAccordionDetails-root": {
        columns: '2 auto',
      },
      "& .MuiTextField-root": {
        paddingBottom: '5px'
      },
      "& .MuiAccordionSummary-root.Mui-expanded": {
        minHeight: '45px !important',
        maxHeight: '45px !important',
        backgroundColor: '#1f2a3c !important',
        borderRadius: '5px 5px 0px 0px !important'
      },
      "& .MuiTypography-root": {
        fontSize: '13px'
      }
    }
  }));

  const classes = useStyles();
  let clone_obj = Object.assign({}, props.objList[props.selectedIndex]);
  const [ruleSettings, setRuleSettings] = useState([]);
  const [expandedList, setExpanded] = React.useState([]);

  useEffect(() => {
    if (clone_obj.rule_settings && clone_obj.rule_settings.length) {
      setRuleSettings(clone_obj.rule_settings);
      const names = clone_obj.rule_settings.map((rec) => rec.model_name);
      const expandObj = [];
      names.map((nm) => {
        let obj = {
          key: nm,
          expanded: true,
        };
        expandObj.push(obj);
      });
      setExpanded(expandObj);
    }
  }, []);

  const getStepsContent = (ruleRec, parentIdx) => (
    <Fragment>
      {ruleRec.map((rec, childIdx) => (
        <Fragment>
          {rec.type === "text" ? (
            <TextField
              autoComplete="off"
              name={rec.name}
              label={rec.label}
              placeholder={`Enter ${rec.label}`}
              variant="filled"
              // class={classes.iptTxtFldCls}
              value={rec.value}
              disabled={rec.name === 'allowed_directions'}
              sx={{
                width: "100%",
                fontSize: "14px",
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val || (ruleSettings[parentIdx].rules[childIdx].value && ruleSettings[parentIdx].rules[childIdx].value !== val)) {
                  if (typeof props.setData == "function") {
                    ruleSettings[parentIdx].rules[childIdx].value = val;
                    props.setData(clone_obj);
                    var newObjList = [...props.objList];
                    newObjList[props.selectedIndex] = clone_obj;
                    props.setObjList(newObjList);
                  }
                }
              }}
            />
          ) :
            // rec.type === "select" ? (
            //   <SingleSelect
            //     width={270}
            //     label={rec.label}
            //     options={rec.options || []}
            //     propKey="value"
            //     class={classes.selectFldCls}
            //     selectedVal={rec.value}
            //     setSelectVal={(val) => {
            //       if (val) {
            //         if (typeof props.setData == "function") {
            //           ruleSettings[parentIdx].rules[childIdx].value = val;
            //           props.setData(clone_obj);
            //         }
            //       }
            //     }}
            //   />
            // ) : 
            null}
        </Fragment>
      ))}
    </Fragment>
  );

  const handleChange = (panel) => (event, newExpanded) => {
    const list = [];
    expandedList.map((rec) => {
      if (rec.key === panel) {
        rec.expanded = newExpanded;
      }
      list.push(rec);
    });
    setExpanded(list);
  };

  const getExpanded = (currentRec) => {
    let returnExpand = false;
    expandedList.map((rec) => {
      if (rec.key === currentRec.model_name) {
        returnExpand = rec.expanded;
      }
    });
    return returnExpand;
  };

  return (
    <Grid
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      container
      className={classes.mainContainer}
    >
      <Grid key={1} item>
        {/* {ruleSettings && ruleSettings.length ? getStepsContent("rules") : null} */}
        {ruleSettings.length &&
          ruleSettings.map((rec, idx) => {
            return rec.rules && rec.rules.length > 0 ? (
              <Accordion
                expanded={getExpanded(rec)}
                key={`rule-settings-${idx}`}
                onChange={handleChange(rec.model_name)}
                className={classes.rulesAcc}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`rule-content${idx + 1}`}
                  id={`rule-header${idx + 1}`}
                >
                  <Typography>{rec.model_name ? rec.model_name.toUpperCase() : ''}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{getStepsContent(rec.rules, idx)}</Typography>
                </AccordionDetails>
              </Accordion>
            ) : null;
          })}
      </Grid>
    </Grid>
  );
};

export default RulesSettings;
