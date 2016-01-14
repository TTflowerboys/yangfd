//
//  CUTESingleRoomPreferenceViewController.swift
//  currant
//
//  Created by Foster Yin on 12/29/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTESingleRoomPreferenceViewController)
class CUTESingleRoomPreferenceViewController: CUTEFormViewController {

    func form() -> CUTESingleRoomPreferenceForm {
        return self.formController.form as! CUTESingleRoomPreferenceForm
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the

        self.title = STR("SingleRoomPreference/单间信息")
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: STR("SingleRoomPreference/预览"), style: UIBarButtonItemStyle.Plain, block:  { (sender) -> Void in

            //TODO add track duration
            SVProgressHUD.show()
            CUTERentTicketPublisher.sharedInstance().previewTicket(self.form().ticket, updateStatus: { (status:String!) -> Void in
                SVProgressHUD.showWithStatus(status)
                }, cancellationToken: nil).continueWithBlock( { (task:BFTask!) -> AnyObject! in

                    if task.error != nil {
                        SVProgressHUD.showErrorWithError(task.error)
                    }
                    else if task.exception != nil {
                        SVProgressHUD.showErrorWithException(task.exception)
                    }
                    else if task.cancelled {
                        SVProgressHUD.showErrorWithCancellation()
                    }
                    else {
                        SVProgressHUD.dismiss()
                        CUTEDataManager.sharedInstance().saveRentTicket(self.form().ticket)

                        if let identifier = self.form().ticket.identifier {
                            let controller = CUTERentTicketPreviewViewController()
                            controller.ticket = self.form().ticket
                            controller.URL = CUTEPermissionChecker.URLWithPath("/wechat-poster/" + identifier)
                            controller.loadRequest(NSURLRequest(URL:controller.URL))
                            self.navigationController?.pushViewController(controller, animated: true)
                        }
                    }

                    return task
                })
        })
    }



    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    //MARK: TableView

    override func tableView(tableView: UITableView, willDisplayCell cell: UITableViewCell, forRowAtIndexPath indexPath: NSIndexPath) {
        let field = self.formController.fieldForIndexPath(indexPath)

        if field.key == "genderRequirement" {
            let gender = self.form().ticket.genderRequirement
            if gender != nil {
                if gender == "male" {
                    cell.detailTextLabel?.text = STR("男")
                }
                else if  gender == "female" {
                    cell.detailTextLabel?.text = STR("女")
                }
                else {
                    cell.detailTextLabel?.text = STR("不限")
                }
            }
            else {
                cell.detailTextLabel?.text = STR("不限")
            }
        }
        else if field.key == "age" {
            var minAge:NSInteger = 0
            if self.form().ticket.minAge != nil {
                minAge = self.form().ticket.minAge!.integerValue
            }

            var maxAge:NSInteger = 0
            if self.form().ticket.maxAge != nil {
                maxAge = self.form().ticket.maxAge!.integerValue
            }
            cell.detailTextLabel?.text = CUTEFormAgeRangePickerCell.formattedDisplayTextWithMinAge(minAge, maxAge: maxAge)
        }
        else if field.key == "occupation" {
            if let occupation = self.form().ticket.occupation {
                cell.detailTextLabel?.text = occupation.value;
            }
            else {
                cell.detailTextLabel?.text = STR("不限")
            }
        }
        else if field.key == "noSmoking" {

        }
        else if field.key == "noPet" {
        }
        else if field.key == "noBaby" {
        }
        else if field.key == "currentMaleRoommates" {
            if let number = self.form().ticket.currentMaleRoommates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field.key == "currentFemaleRoommates" {
            if let number = self.form().ticket.currentFemaleRoommates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field.key == "availableRooms" {
            if let number = self.form().ticket.availableRooms {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field.key == "area" {
            if let space = self.form().ticket.space {
                cell.detailTextLabel?.text = "\(space.value!) \(space.unitPresentation())"
            }
        }
        else if field.key == "independentBathroom" {
        }
        else if field.key == "otherRequirements" {
            cell.detailTextLabel?.text = self.form().ticket.otherRequirements
        }
    }

    //MARK: - Field Action 
    func onGenderRequirementEdit(sender:AnyObject)  {
        self.navigationController?.popViewControllerAnimated(true)
        if let cell = sender as? UITableViewCell {
            var gender:String = ""
            if let text = cell.detailTextLabel?.text {
                if text == STR("男") {
                    gender = "male"
                }
                else if text == STR("女") {
                    gender = "female"
                }
            }
            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.genderRequirement = gender
            })
        }
    }

    func onAgeEdit(sender:AnyObject) {
        if let cell = sender as? CUTEFormAgeRangePickerCell {
            let minInt = cell.pickerView.selectedRowInComponent(0)
            let maxInt = cell.pickerView.selectedRowInComponent(1)
            var minAge:NSNumber?
            if minInt > 0 {
                minAge = NSNumber(integer: minInt)
            }
            var maxAge:NSNumber?
            if maxInt > 0 {
                maxAge = NSNumber(integer: maxInt)
            }

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.minAge = minAge
                ticket.maxAge = maxAge
            })
        }
    }
    
    func onOccupationEdit(sender:AnyObject) {
        self.navigationController?.popViewControllerAnimated(true)
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! CUTEEnum

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                if (value.slug == "unlimited") {
                    ticket.occupation = nil
                }
                else {
                    ticket.occupation = value
                }
            })
        }
    }

    func onNoSmokingEdit(sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.noSmoking = value
            })
        }
    }

    func onNoPetEdit(sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.noPet = value
            })
        }
    }
    
    func onNoBabyEdit(sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.noBaby = value
            })
        }

    }

    func onCurrentMaleRoommatesEdit(sender:AnyObject) {
        if let cell = sender as? CUTEFormRoommateCountPickerCell {
            let value = cell.pickerView.selectedRowInComponent(0)

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.currentMaleRoommates = NSNumber(integer: value)
            })
        }
    }

    func onCurrentFemaleRoommatesEdit(sender:AnyObject) {
        if let cell = sender as? CUTEFormRoommateCountPickerCell {
            let value = cell.pickerView.selectedRowInComponent(0)

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.currentFemaleRoommates = NSNumber(integer: value)
            })
        }
    }
    
    func onAvailableRoomsEdit(sender:AnyObject) {
        if let cell = sender as? CUTEFormRoommateCountPickerCell {
            let value = cell.pickerView.selectedRowInComponent(0)

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.availableRooms = NSNumber(integer: value)
            })
        }
    }

    func onIndependentBathroomEdit(sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.independentBathroom = value
            })
        }
    }

    func onOtherRequirements(sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! String

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                ticket.otherRequirements = value
            })
        }
    }

    func onAreaEdit(sender:AnyObject) {
        let controller = CUTERentAreaViewController()
        let form = CUTEAreaForm()
        form.ticket = self.form().ticket
        if let space = self.form().ticket.space {
            form.area = space.value
            form.unitPresentation = space.unitPresentation()
        }
        controller.formController.form = form
        controller.updateRentAreaCompletion = {
            //TODO
        }
        self.navigationController?.pushViewController(controller, animated: true)

    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
