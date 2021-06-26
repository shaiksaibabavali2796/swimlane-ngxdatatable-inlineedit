import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ngx-datatable-project';
  datachanged = false;
  constructor(private http:HttpClient, private toaster:ToastrService){
  }

  editSource: boolean = false;
  loading: boolean = false;
  invalidedit: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>

  options: any = [
    {id:0, description: ''},
    {id:1, description:'Claimed'},
    {id:2, description:'Unclaimed'},
    {id:3, description: 'Pending'},
    {id:4, description: 'Completed'}
  ]

  listData:Array<any> = [];

  listColumns:Array<any> = [
    {name:'Source', prop: 'source', sortable: 'false', width: 200, type:'source'},
    {name:'Category', prop: 'category', sortable:'false', width: 200, type:'category'},
    {name:'Amount', prop:'amount', sortable:'false', width: 200, type:'amount'},
    {name:'Comments', prop:'comments', sortable:"false", width: 200, type:'comments'},
    {name:'Date', prop:'date', sortable:'false', width: 150, type:'date'},
    {name:'User Edited', prop:'userEdited', sortable:'false', width: 150, type:'checkbox'},
    {name: 'Reviewed', prop:'reviewed', sortable:'false', width: 150, type:'toggle' }
  ]




  ngOnInit(): void {
  this.loading = true
  this.getTabledata();
  }


  getTabledata(){
    this.http.get('https://ngx-datatable-52df4-default-rtdb.firebaseio.com/tabledata.json').subscribe((response: any) => {
      this.listData = response;
      this.invalidedit = false;
      this.loading = false
      this.bsConfig = Object.assign({}, {showWeekNumbers: false })
      this.listData.forEach((rowData, index) => {
        rowData.uniqueid = index;
        rowData.originaldate = rowData.date ? new Date(rowData.date): "";
      })
    }, (error) => {
      console.log(error);
    })
  }

  saveEditedData(){
    if(this.invalidedit == true){
      this.toaster.error('Please enter Valid Inputs for the Highlighted fields and Save')
    }else{

    this.formatPayload(this.listData);
 
    this.http.put('https://ngx-datatable-52df4-default-rtdb.firebaseio.com/tabledata.json',this.listData).subscribe((response: any) =>{
      // this.listData = response
    })
    this.datachanged = false;
    this.loading = true;
    setTimeout(() => {
      this.ngOnInit();
    }, 1500);
  }
  }


  formatPayload(editedData){
    this.listData.forEach(rowData =>{
      delete rowData.editcategory
      delete rowData.editSource
      delete rowData.editcomments
      delete rowData.editdate
    })
    return this.listData
  }

  resetOrginalData(){
    this.ngOnInit();
    this.datachanged = false
  }

  // dataChanged(row, keyValue, rowIndex){
  //   this.datachanged = true
  // }

  showInlineEdit(row, keyValue, rowIndex){
    this.datachanged = true;
    if(keyValue == "editSource"){
      row[keyValue] = true
    } else if(keyValue == "editcategory"){
      row[keyValue] = true
      console.log(row[keyValue])
    } else if(keyValue == "editcomments"){
      row[keyValue] = true
    }else if(keyValue == "editdate"){
      row[keyValue] = true;
      row.date = new Date();
    }
    else{
      return
    }
  
  }

  tabledataEdited(row, fields, rowIndex){
    console.log(row,rowIndex)
    if(fields == "category" || fields == "source"){
      let checkfields = fields == "category" ? row.category : row.source;
    if(/^[a-zA-Z ]*$/i.test(checkfields) == false){
     this.toaster.warning(`Please dont add Numbers in the ${fields} field`)
    //  row[fields] = "";
     this.invalidedit = true;
     row[fields+'error'] = true
     setTimeout(() => {
       this.toaster.info("Click on the Undo icon to get the Previous Value");
     }, 3000);
     return false
    }else{
      row[fields+'error'] = false;
      this.invalidedit = false;
      return
    }
     
  }
}

getRowclass = (row) => {
  return {
    'disabled-row': row.reviewed ? false : true
  }
}


}
