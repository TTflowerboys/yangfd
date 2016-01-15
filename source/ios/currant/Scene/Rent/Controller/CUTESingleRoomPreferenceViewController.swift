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

            if CUTEKeyboardStateListener.sharedInstance().visible {
                //will trigger save other requirement
                let field = self.formController.fieldForKey("otherRequirements")
                let indexPath = self.formController.indexPathForField(field)
                self.tableView.cellForRowAtIndexPath(indexPath)?.resignFirstResponder()
            }

            if let screenName = CUTETracker.sharedInstance().getScreenNameFromObject(self) {
                CUTETracker.sharedInstance().trackEventWithCategory(screenName, action: kEventActionPress, label: "preview-and-publish", value: nil)
                CUTETracker.sharedInstance().trackStayDurationWithCategory(KEventCategoryPostRentTicket, screenName: screenName)
            }

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

    //TODO: do i need here or setup by the form field's value?
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
            cell.accessoryType = UITableViewCellAccessoryType.DisclosureIndicator
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
            if  let switchCell  = cell as? FXFormSwitchCell {
                switchCell.switchControl.on = self.form().ticket.noSmoking!.boolValue
            }
        }
        else if field.key == "noPet" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                switchCell.switchControl.on = self.form().ticket.noPet!.boolValue
            }
        }
        else if field.key == "noBaby" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                switchCell.switchControl.on = self.form().ticket.noBaby!.boolValue
            }
        }
        else if field.key == "currentMaleRoommates" {
            cell.accessoryType = UITableViewCellAccessoryType.DisclosureIndicator
            if let number = self.form().ticket.currentMaleRoommates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field.key == "currentFemaleRoommates" {
            cell.accessoryType = UITableViewCellAccessoryType.DisclosureIndicator
            if let number = self.form().ticket.currentFemaleRoommates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field.key == "availableRooms" {
            cell.accessoryType = UITableViewCellAccessoryType.DisclosureIndicator
            if let number = self.form().ticket.availableRooms {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field.key == "area" {
            cell.accessoryType = UITableViewCellAccessoryType.DisclosureIndicator
            if let space = self.form().ticket.space {
                cell.detailTextLabel?.text = "\(space.value!) \(space.unitPresentation())"
            }
        }
        else if field.key == "independentBathroom" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                switchCell.switchControl.on = self.form().ticket.independentBathroom!.boolValue
            }
        }
        else if field.key == "otherRequirements" {
            if let requirement = self.form().ticket.otherRequirements {
                cell.detailTextLabel?.text = requirement
            }
        }
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let field = self.formController.fieldForIndexPath(indexPath)
        let cell = tableView.cellForRowAtIndexPath(indexPath)

        if field.key == "age" {
            if let pickerCell = cell as? CUTEFormAgeRangePickerCell {
                var minAgeRow = 0
                if let age = self.form().ticket.minAge {
                    minAgeRow = age.integerValue
                }

                var maxAgeRow = 0
                if let age = self.form().ticket.maxAge {
                    maxAgeRow = age.integerValue
                }

                pickerCell.pickerView.selectRow(minAgeRow, inComponent: 0, animated: false)
                pickerCell.pickerView.selectRow(maxAgeRow, inComponent: 1, animated: false)
            }
        }
        else if field.key == "currentMaleRoommates" {
            if let pickerCell = cell as? CUTEFormRoommateCountPickerCell {
                var row = 0
                if let count = self.form().ticket.currentMaleRoommates {
                    row = count.integerValue
                }
                pickerCell.pickerView.selectRow(row, inComponent: 0, animated: false)
            }
        }
        else if field.key == "currentFemaleRoommates" {
            if let pickerCell = cell as? CUTEFormRoommateCountPickerCell {
                var row = 0
                if let count = self.form().ticket.currentFemaleRoommates {
                    row = count.integerValue
                }
                pickerCell.pickerView.selectRow(row, inComponent: 0, animated: false)
            }
        }
        else if field.key == "availableRooms" {
            if let pickerCell = cell as? CUTEFormRoommateCountPickerCell {
                var row = 0
                if let count = self.form().ticket.availableRooms {
                    row = count.integerValue
                }
                pickerCell.pickerView.selectRow(row, inComponent: 0, animated: false)
            }
        }
    }

    //MARK: - Field Action 
    func onGenderRequirementEdit(sender:AnyObject)  {
        self.navigationController?.popViewControllerAnimated(true)
        var gender:String = ""
        if let text = self.form().genderRequirement {
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

    func onAgeEdit(sender:AnyObject) {
        if let cell = sender as? CUTEFormAgeRangePickerCell {
            let minInt = cell.pickerView.selectedRowInComponent(0)
            let maxInt = cell.pickerView.selectedRowInComponent(1)
            var minAge:NSNumber?
            if minInt > 0 {
                minAge = NSNumber(integer: minInt)
            }
            else {
                minAge = nil
            }
            var maxAge:NSNumber?
            if maxInt > 0 {
                maxAge = NSNumber(integer: maxInt)
            }
            else {
                maxAge = nil
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
                if value.characters.count > 0 {
                    ticket.otherRequirements = value
                }
                else {
                    ticket.otherRequirements = nil
                }
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
        controller.singleRoomArea = true
        controller.formController.form = form
        controller.updateRentAreaCompletion = {
            let field = self.formController.fieldForKey("area")
            let indexPath = self.formController.indexPathForField(field)
            self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: UITableViewRowAnimation.None)
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
