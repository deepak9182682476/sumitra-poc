import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RndfService } from './rndf.service';

describe('RndfService', () => {
  let service: RndfService;
  let httpTestingController: HttpTestingController;
  let ROOT_URl = 'http://localhost:5109/api/response';


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RndfService]
    });
    service = TestBed.inject(RndfService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Api call for getRndfConfiguration', () => {
    let result = [
      {
        "data": [
          {
            "id": 34,
            "title": "RNDF",
            "file_name": "1607429410891.txt",
            "updated_date": "2020-12-08T06:40:09.534Z",
            "file_data": {
              "RNDF_name": "Sample_RNDF_Rev_1.5",
              "num_segments": "3",
              "num_zones": "1",
              "segments": [
                {
                  "number": "1\r",
                  "num_lanes": "2\r",
                  "segment_name": "Michigan_Ave\r",
                  "exit": [
                    [
                      "1.2.4",
                      "3.1.1"
                    ],
                    [
                      "1.2.6",
                      "4.1.1"
                    ]
                  ],
                  "lanes": [
                    {
                      "id": "1.1",
                      "num_waypoints": "8",
                      "lane_width": "12",
                      "left_boundary": "double_yellow",
                      "right_boundary": "broken_white",
                      "waypoints": [
                        {
                          "id": "1.1.1",
                          "lon": "76.54102095",
                          "lat": "14.39570187"
                        },
                        {
                          "id": "1.1.2",
                          "lon": "76.54085866",
                          "lat": "14.39534778"
                        },
                        {
                          "id": "1.1.3",
                          "lon": "76.54059309",
                          "lat": "14.3948314"
                        },
                        {
                          "id": "1.1.4",
                          "lon": "76.54032753",
                          "lat": "14.39432977"
                        },
                        {
                          "id": "1.1.5",
                          "lon": "76.54007671",
                          "lat": "14.39385765"
                        },
                        {
                          "id": "1.1.6",
                          "lon": "76.53967836",
                          "lat": "14.39309046"
                        },
                        {
                          "id": "1.1.7",
                          "lon": "76.53858659",
                          "lat": "14.39090691"
                        },
                        {
                          "id": "1.1.8",
                          "lon": "76.53764241",
                          "lat": "14.38910382"
                        }
                      ]
                    },
                    {
                      "id": "1.2",
                      "num_waypoints": "6",
                      "lane_width": "12",
                      "left_boundary": "broken_white",
                      "waypoints": [
                        {
                          "id": "1.2.1",
                          "lon": "76.53741764",
                          "lat": "14.38874544"
                        },
                        {
                          "id": "1.2.2",
                          "lon": "76.53646033",
                          "lat": "14.38712824"
                        },
                        {
                          "id": "1.2.3",
                          "lon": "76.5360235",
                          "lat": "14.38643117"
                        },
                        {
                          "id": "1.2.4",
                          "lon": "76.53543796",
                          "lat": "14.38547386"
                        },
                        {
                          "id": "1.2.5",
                          "lon": "76.53482454",
                          "lat": "14.38438643"
                        },
                        {
                          "id": "1.2.6",
                          "lon": "76.5342297",
                          "lat": "14.38337336"
                        }
                      ]
                    }
                  ]
                },
                {
                  "number": "2",
                  "num_lanes": "1",
                  "segment_name": "California_Drive",
                  "exit": [
                    [
                      "2.1.5",
                      "1.2.1"
                    ],
                    [
                      "2.1.6",
                      "1.2.2"
                    ]
                  ],
                  "lanes": [
                    {
                      "id": "2.1",
                      "num_waypoints": "7",
                      "waypoints": [
                        {
                          "id": "2.1.1",
                          "lon": "76.534397",
                          "lat": "14.38334548"
                        },
                        {
                          "id": "2.1.2",
                          "lon": "76.53475018",
                          "lat": "14.38332689"
                        },
                        {
                          "id": "2.1.3",
                          "lon": "76.53530784",
                          "lat": "14.38331759"
                        },
                        {
                          "id": "2.1.4",
                          "lon": "76.5366741",
                          "lat": "14.38329901"
                        },
                        {
                          "id": "2.1.5",
                          "lon": "76.53799388",
                          "lat": "14.38325253"
                        },
                        {
                          "id": "2.1.6",
                          "lon": "76.53920214",
                          "lat": "14.38324324"
                        },
                        {
                          "id": "2.1.7",
                          "lon": "76.54011297",
                          "lat": "14.38321536"
                        }
                      ]
                    }
                  ]
                },
                {
                  "number": "3",
                  "num_lanes": "1",
                  "segment_name": "Indiana_Rd",
                  "exit": [
                    [
                      "3.1.3",
                      "13.1.10"
                    ],
                    [
                      "3.1.3",
                      "13.2.1"
                    ],
                    [
                      "3.1.7",
                      "10.1.6"
                    ],
                    [
                      "3.1.7",
                      "10.2.3"
                    ],
                    [
                      "3.1.9",
                      "9.1.1"
                    ]
                  ],
                  "lanes": [
                    {
                      "id": "3.1",
                      "num_waypoints": "9",
                      "lane_width": "12",
                      "left_boundary": "double_yellow",
                      "waypoints": [
                        {
                          "id": "3.1.1",
                          "lon": "76.54050333",
                          "lat": "14.38322465"
                        },
                        {
                          "id": "3.1.2",
                          "lon": "76.54186029",
                          "lat": "14.38319677"
                        },
                        {
                          "id": "3.1.3",
                          "lon": "76.54521552",
                          "lat": "14.38313171"
                        },
                        {
                          "id": "3.1.4",
                          "lon": "76.54616354",
                          "lat": "14.38311312"
                        },
                        {
                          "id": "3.1.5",
                          "lon": "76.54723238",
                          "lat": "14.38308524"
                        },
                        {
                          "id": "3.1.6",
                          "lon": "76.54844993",
                          "lat": "14.38307594"
                        },
                        {
                          "id": "3.1.7",
                          "lon": "76.54908194",
                          "lat": "14.38307594"
                        },
                        {
                          "id": "3.1.8",
                          "lon": "76.54922135",
                          "lat": "14.38307594"
                        },
                        {
                          "id": "3.1.9",
                          "lon": "76.54942583",
                          "lat": "14.38307594"
                        }
                      ]
                    }
                  ]
                }
              ],
              "zones": [
                {
                  "number": "14",
                  "num_spots": "6",
                  "zone_name": "Central_Parking_Lot",
                  "perimeter": {
                    "id": "14.0",
                    "num_perimeterpoints": "6",
                    "waypoints": [
                      {
                        "id": "14.0.1",
                        "lon": "-77.203339",
                        "lat": "38.872271"
                      },
                      {
                        "id": "14.0.2",
                        "lon": "-77.202804",
                        "lat": "38.872258"
                      },
                      {
                        "id": "14.0.3",
                        "lon": "-77.202315",
                        "lat": "38.872264"
                      },
                      {
                        "id": "14.0.4",
                        "lon": "-77.202309",
                        "lat": "38.871959"
                      },
                      {
                        "id": "14.0.5",
                        "lon": "-77.203136",
                        "lat": "38.871948"
                      },
                      {
                        "id": "14.0.6",
                        "lon": "-77.203331",
                        "lat": "38.871947"
                      }
                    ]
                  },
                  "spots": [
                    {
                      "id": "14.1",
                      "spot_width": "16",
                      "waypoints": [
                        {
                          "id": "14.1.1",
                          "lon": "-77.202972",
                          "lat": "38.872151"
                        },
                        {
                          "id": "14.1.2",
                          "lon": "-77.202971",
                          "lat": "38.872103"
                        }
                      ]
                    },
                    {
                      "id": "14.2",
                      "spot_width": "16",
                      "waypoints": [
                        {
                          "id": "14.2.1",
                          "lon": "-77.202907",
                          "lat": "38.872152"
                        },
                        {
                          "id": "14.2.2",
                          "lon": "-77.202906",
                          "lat": "38.872104"
                        }
                      ]
                    },
                    {
                      "id": "14.3",
                      "spot_width": "16",
                      "waypoints": [
                        {
                          "id": "14.3.1",
                          "lon": "-77.202843",
                          "lat": "38.872152"
                        },
                        {
                          "id": "14.3.2",
                          "lon": "-77.202840",
                          "lat": "38.872104"
                        }
                      ]
                    },
                    {
                      "id": "14.4",
                      "spot_width": "16",
                      "waypoints": [
                        {
                          "id": "14.4.1",
                          "lon": "-77.202772",
                          "lat": "38.872152"
                        },
                        {
                          "id": "14.4.2",
                          "lon": "-77.202770",
                          "lat": "38.872105"
                        }
                      ]
                    },
                    {
                      "id": "14.5",
                      "spot_width": "16",
                      "waypoints": [
                        {
                          "id": "14.5.1",
                          "lon": "-77.202708",
                          "lat": "38.872153"
                        },
                        {
                          "id": "14.5.2",
                          "lon": "-77.202707",
                          "lat": "38.872106"
                        }
                      ]
                    },
                    {
                      "id": "14.6",
                      "spot_width": "16",
                      "waypoints": [
                        {
                          "id": "14.6.1",
                          "lon": "-77.202645",
                          "lat": "38.872153"
                        },
                        {
                          "id": "14.6.2",
                          "lon": "-77.202643",
                          "lat": "38.872106"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ];
    service.getRndfConfiguration().subscribe(data => {
      expect(data.length).toBeGreaterThan(0);
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/get-rndf`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it("should call saveRndfConfiguration API", () => {
    const formData = new FormData();
    formData.append('file', null);
    formData.append('file_name', '');
    service.saveRndfConfiguration(formData).subscribe();

    let req = httpTestingController.expectOne({ method: "POST", url: `${ROOT_URl}/save-rndf` });
    expect(req.request.body).toEqual(formData);
  });

  it("should call updateRndfConfiguration API", () => {
    const formData = new FormData();
    formData.append('file_name', '');
    formData.append('id', '1');
    if (formData) {
      formData.append('old_file_name', '');
      formData.append('file', '');
    }
    service.updateRndfConfiguration(formData).subscribe();

    let req = httpTestingController.expectOne({ method: "PUT", url: `${ROOT_URl}/update-rndf` });
    expect(req.request.body).toEqual(formData);
  });

  it("should call deleteRndfConfiguration API", () => {
    let data = {
      id: 1,
      file_name: '',
      title: ''
    }

    service.deleteRndfConfiguration(data).subscribe();

    let req = httpTestingController.expectOne({ method: "DELETE", url: `${ROOT_URl}/delete-rndf/${data.id}/${data.file_name}` });
    expect(req).toBeDefined();
  });

  it("should throw error when delete API fails", () => {
    let error: string;
    let data = {
      id: 1,
      file_name: '',
      title: ''
    }
    service.deleteRndfConfiguration(data).subscribe({
      next: () => { }, error: (e) => {
        error = e;
      }
    });

    let req = httpTestingController.expectOne({
      method: "DELETE",
      url: `${ROOT_URl}/delete-rndf/${data.id}/${data.file_name}`
    });
    req.flush("Something went wrong", {
      status: 404,
      statusText: "Network error"
    });

    expect(error.indexOf("Network error") >= 0).toBeTruthy();
  });

  it("should getRndfConfiguration throw error", () => {
    let error: string;
    service.getRndfConfiguration().subscribe({
      next: () => { }, error: (e) => {
        error = e;
      }
    });

    let req = httpTestingController.expectOne(`${ROOT_URl}/get-rndf`);
    req.flush("Something went wrong", {
      status: 404,
      statusText: "Network error"
    });
    expect(error.indexOf("Network error") >= 0).toBeTruthy();
  });

});
