// import React from 'react';
import React, { Component as ReactComponent } from 'react';
import Head from '../components/head';
import Moment from 'react-moment';
//import SDK, { Component } from '../shared/sdk/';
//import * as Services from './../shared/sdk/services';

class Package extends ReactComponent {
  // constructor() {
  //   super(props)
  //  // super({services: ['PackageApi']});
  // }

  static async getInitialProps({ req }) {
  //  return {};
    //console.log(req);
    //console.log(req);
    if (req) {
      const Services = await import('./../shared/sdk/services/index.js');
      let packageId = req.params["id"];
      if (!packageId) {
        packageId = req.query['id'];
      }

      if (!packageId) {
       // console.log(req);
      }

     // console.log(req.params);
     // console.log(packageId);
      //console.log(packageId);
      // console.log(req.params.id);
      // console.log(req.query["package"]);
      this['PackageApi'] = new Services['PackageApi']();
      const data = await this.PackageApi.findOne({
        where: {
          identifier: packageId
        },
        include: ['latestVersion']
      }).first().toPromise();

      // console.log(data);
      let descriptionHTML = "";
      if (data["detailedDescription"]) {
        const QuillDeltaToHtmlConverter = await import('quill-delta-to-html');
        const quillConverter = new QuillDeltaToHtmlConverter(data["detailedDescription"]["ops"], {});
        descriptionHTML = quillConverter.convert();
      }

      let url = "";
      url += "https://packix.ioscreatix.com/package/";
      url += data["identifier"];

      if (!data.latestVersion.changes) data.latestVersion.changes = [];
     // console.log(data.latestVersion.createdOn);
      //data.latestVersion.createdOn = new Date(data.latestVersion.createdOn);
     // console.log(data.latestVersion.createdOn);

      if (!descriptionHTML || descriptionHTML.length < 1) {
        descriptionHTML = "No Description has been provided for this package.";
      }

      let urlDict = {
        "url": url
      };

      return {
        data: data,
        descriptionHTML: descriptionHTML,
        title: data["name"],
        description: data["shortDescription"],
        url: urlDict
      }
    }

    return {};
    // const data = await this.PackageApi.find().first().toPromise();
    // console.log(data);
    // return {
    //   data: data.toString()
    // }
  }

  // componentDidMount() {
  //   this.PackageApi.find().subscribe(data => {
  //     console.log(data);
  //     this.props.data = data;
  //   })
  // }

  render() {
    return (
      <div>
        <Head title={this.props.title} description={this.props.description} url={this.props.url.url} />
        <style jsx global>{`
          body {
               -webkit-text-size-adjust:none;
               -webkit-touch-callout:none;
               -webkit-user-select:text;
               -webkit-tap-highlight-color: rgba(0,0,0,0);
               margin: 9px auto;
               width: device-width;
               max-width: 414px !important;
               font-family: ".SFNSText-Medium", -apple-system, "Helvetica Neue", "Lucida Grande", sans-serif;
               background-color: #f4f4f4;
               min-font-size: 13px;
               text-align:center;
               font-family: "SF Pro Display","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif;
               font-weight:500;
               font-size:15px;
           }

        `}
        </style>
        <panel className="modern">
          <panel-header>
            <label>Description</label>
          </panel-header>
          <panel-body style={{fontSize: '14px'}}>
            <div className="package-description" dangerouslySetInnerHTML={{ __html: this.props.descriptionHTML }}>
            </div>
          </panel-body>
        </panel>
        <panel className="modern">
          <panel-header>
            <label>What's New?</label>
          </panel-header>
          <panel-body>
            {this.props.data.latestVersion.changes.length > 0 && (
            <ul>
              {this.props.data.latestVersion.changes.map(function(change, index){
                return <li key={ index }><span className="change-content">{change}</span></li>;
              })}
            </ul>)}

            {this.props.data.latestVersion.changes.length < 1 && (
              <span>No changes were reported for this package version</span>)}
          </panel-body>
        </panel>
        <panel className="modern">
          <panel-header>
            <label>Information</label>
          </panel-header>
          <panel-body style={{paddingTop: '13px', paddingBottom: '13px'}}>
                <table className="information" cols="2" border="0">
                  <tbody>
                  <tr>
                    <td>Version</td>
                    <td>{this.props.data.latestVersion.version}</td>
                  </tr>
                  <tr>
                    <td>Updated</td>
                    <td>
                      <Moment interval={0} locale="en" date={this.props.data.latestVersion.createdOn} format="LL" />
                    </td>
                  </tr>
                  <tr>
                    <td>License</td>
                    {this.props.data.isPaid && (
                      <td class="detail">Commercial Package</td>
                    )}
                    {!this.props.data.isPaid && (
                      <td>Free Package</td>
                    )}
                  </tr>
                  {this.props.data.isPaid && (
                    <tr>
                      <td>Suggested Price</td>
                      <td>$ {this.props.data.price}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Downloads</td>
                    <td>{this.props.data.latestVersion.downloadCount}</td>
                  </tr>
                  </tbody>
                </table>
          </panel-body>
        </panel>
      </div>
    )
  }
}

export default Package;
