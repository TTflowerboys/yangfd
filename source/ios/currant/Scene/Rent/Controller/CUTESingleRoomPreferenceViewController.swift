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
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: STR("SingleRoomPreference/预览"), style: UIBarButtonItemStyle.plain, block:  { (sender) -> Void in

            if let otherRequirement = self.form().otherRequirements {
                if CUTEContactChecker.checkShowContactForbiddenWarningAlert(otherRequirement) {
                    return
                }
            }
            
            self.submitTicket()
        })
    }



    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    //MARK: TableView

    //TODO: do i need here or setup by the form field's value?
    override func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        let field = self.formController.field(for: indexPath)

        if field?.key == "genderRequirement" {
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
        else if field?.key == "age" {
            cell.accessoryType = UITableViewCellAccessoryType.disclosureIndicator
            var minAge:NSInteger = 0
            if let minAgeNumber = self.form().ticket.minAge {
                minAge = minAgeNumber.intValue
            }

            var maxAge:NSInteger = 0
            if let maxAgeNumber = self.form().ticket.maxAge {
                maxAge = maxAgeNumber.intValue
            }
            cell.detailTextLabel?.text = CUTEFormAgeRangePickerCell.formattedDisplayText(withMinAge: minAge, maxAge: maxAge)
        }
        else if field?.key == "occupation" {
            if let occupation = self.form().ticket.occupation {
                cell.detailTextLabel?.text = occupation.value;
            }
            else {
                cell.detailTextLabel?.text = STR("不限")
            }
        }
        else if field?.key == "noSmoking" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                if let value = self.form().ticket.noSmoking {
                    switchCell.switchControl.isOn = value.boolValue
                }
            }
        }
        else if field?.key == "noPet" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                if let value = self.form().ticket.noPet {
                    switchCell.switchControl.isOn = value.boolValue
                }
            }
        }
        else if field?.key == "noBaby" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                if let value = self.form().ticket.noBaby {
                    switchCell.switchControl.isOn = value.boolValue
                }
            }
        }
        else if field?.key == "currentMaleRoommates" {
            cell.accessoryType = UITableViewCellAccessoryType.disclosureIndicator
            if let number = self.form().ticket.currentMaleRoommates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field?.key == "currentFemaleRoommates" {
            cell.accessoryType = UITableViewCellAccessoryType.disclosureIndicator
            if let number = self.form().ticket.currentFemaleRoommates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field?.key == "accommodates" {
            cell.accessoryType = UITableViewCellAccessoryType.disclosureIndicator
            if let number = self.form().ticket.accommodates {
                cell.detailTextLabel?.text = STR("\(number)人")
            }
        }
        else if field?.key == "area" {
            cell.accessoryType = UITableViewCellAccessoryType.disclosureIndicator
            if let space = self.form().ticket.space {
                cell.detailTextLabel?.text = "\(space.value!) \(space.unitPresentation())"
            }
        }
        else if field?.key == "independentBathroom" {
            if  let switchCell  = cell as? FXFormSwitchCell {
                if let value = self.form().ticket.independentBathroom {
                    switchCell.switchControl.isOn = value.boolValue
                }
            }
        }
        else if field?.key == "otherRequirements" {
            if let requirement = self.form().ticket.otherRequirements {
                cell.detailTextLabel?.text = requirement
            }
        }
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let field = self.formController.field(for: indexPath)
        let cell = tableView.cellForRow(at: indexPath)

        if field?.key == "age" {
            if let pickerCell = cell as? CUTEFormAgeRangePickerCell {
                var minAgeRow = 0
                if let age = self.form().ticket.minAge {
                    minAgeRow = age.intValue
                }

                var maxAgeRow = 0
                if let age = self.form().ticket.maxAge {
                    maxAgeRow = age.intValue
                }

                pickerCell.pickerView.selectRow(minAgeRow, inComponent: 0, animated: false)
                pickerCell.pickerView.selectRow(maxAgeRow, inComponent: 1, animated: false)
            }
        }
        else if field?.key == "currentMaleRoommates" {
            if let pickerCell = cell as? CUTEFormRoommateCountPickerCell {
                var row = 0
                if let count = self.form().ticket.currentMaleRoommates {
                    row = count.intValue
                }
                pickerCell.pickerView.selectRow(row, inComponent: 0, animated: false)
            }
        }
        else if field?.key == "currentFemaleRoommates" {
            if let pickerCell = cell as? CUTEFormRoommateCountPickerCell {
                var row = 0
                if let count = self.form().ticket.currentFemaleRoommates {
                    row = count.intValue
                }
                pickerCell.pickerView.selectRow(row, inComponent: 0, animated: false)
            }
        }
        else if field?.key == "accommodates" {
            if let pickerCell = cell as? CUTEFormRoommateCountPickerCell {
                var row = 0
                if let count = self.form().ticket.accommodates {
                    row = count.intValue
                }
                pickerCell.pickerView.selectRow(row, inComponent: 0, animated: false)
            }
        }
    }

    //MARK: - Field Action 
    func onGenderRequirementEdit(_ sender:AnyObject)  {
        self.navigationController?.popViewController(animated: true)
        var gender:String = ""
        if let text = self.form().genderRequirement {
            if text == STR("男") {
                gender = "male"
            }
            else if text == STR("女") {
                gender = "female"
            }
        }
        self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
            ticket!.genderRequirement = gender
        })
    }

    func onAgeEdit(_ sender:AnyObject) {
        if let cell = sender as? CUTEFormAgeRangePickerCell {
            let minInt = cell.pickerView.selectedRow(inComponent: 0)
            let maxInt = cell.pickerView.selectedRow(inComponent: 1)
            var minAge:NSNumber?
            if minInt > 0 {
                minAge = NSNumber(value: minInt as Int)
            }
            else {
                minAge = nil
            }
            var maxAge:NSNumber?
            if maxInt > 0 {
                maxAge = NSNumber(value: maxInt as Int)
            }
            else {
                maxAge = nil
            }

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.minAge = minAge
                ticket!.maxAge = maxAge
            })
        }
    }
    
    func onOccupationEdit(_ sender:AnyObject) {
        self.navigationController?.popViewController(animated: true)
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! CUTEEnum

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                if (value.slug == "unlimited") {
                    ticket!.occupation = nil
                }
                else {
                    ticket!.occupation = value
                }
            })
        }
    }

    func onAllowSmokingEdit(_ sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.noSmoking = NSNumber(value: !value.boolValue as Bool)
            })
        }
    }

    func onAllowPetEdit(_ sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.noPet = NSNumber(value: !value.boolValue as Bool)
            })
        }
    }
    
    func onAllowBabyEdit(_ sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.noBaby = NSNumber(value: !value.boolValue as Bool)
            })
        }

    }

    func onCurrentMaleRoommatesEdit(_ sender:AnyObject) {
        if let cell = sender as? CUTEFormRoommateCountPickerCell {
            let value = cell.pickerView.selectedRow(inComponent: 0)

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.currentMaleRoommates = NSNumber(value: value as Int)
            })
        }
    }

    func onCurrentFemaleRoommatesEdit(_ sender:AnyObject) {
        if let cell = sender as? CUTEFormRoommateCountPickerCell {
            let value = cell.pickerView.selectedRow(inComponent: 0)

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.currentFemaleRoommates = NSNumber(value: value as Int)
            })
        }
    }
    
    func onAccommodatesEdit(_ sender:AnyObject) {
        if let cell = sender as? CUTEFormRoommateCountPickerCell {
            let value = cell.pickerView.selectedRow(inComponent: 0)

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.accommodates = NSNumber(value: value as Int)
            })
        }
    }

    func onIndependentBathroomEdit(_ sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! NSNumber

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                ticket!.independentBathroom = value
            })
        }
    }

    func onOtherRequirements(_ sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! String

            if CUTEContactChecker.checkShowContactForbiddenWarningAlert(value) {
                return
            }

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                if value.characters.count > 0 {
                    ticket!.otherRequirements = value
                }
                else {
                    ticket!.otherRequirements = nil
                }
            })
        }
    }

    func onAreaEdit(_ sender:AnyObject) {
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
            let field = self.formController.field(forKey: "area")
            let indexPath = self.formController.indexPath(for: field)
            self.tableView.reloadRows(at: [indexPath!], with: UITableViewRowAnimation.none)
        }
        self.navigationController?.pushViewController(controller, animated: true)

    }

    func onSubmit(_ sender:AnyObject) {
        submitTicket()
    }

    // MARK: - Private

    func submitTicket() {
        if CUTEKeyboardStateListener.sharedInstance().isVisible {
            //will trigger save other requirement
            let field = self.formController.field(forKey: "otherRequirements")
            let indexPath = self.formController.indexPath(for: field)
            self.tableView.cellForRow(at: indexPath!)?.resignFirstResponder()
        }

        if let screenName = CUTETracker.sharedInstance().getScreenName(from: self) {
            CUTETracker.sharedInstance().trackEvent(withCategory: screenName, action: kEventActionPress, label: "preview-and-publish", value: nil)
            CUTETracker.sharedInstance().trackStayDuration(withCategory: KEventCategoryPostRentTicket, screenName: screenName)
        }

        SVProgressHUD.show()
        CUTERentTicketPublisher.sharedInstance().previewTicket(self.form().ticket, updateStatus: { (status:String?) -> Void in
            SVProgressHUD.show(withStatus: status)
            }, cancellationToken: nil).continue( { (task:BFTask!) -> AnyObject! in

                if task.error != nil {
                    SVProgressHUD.showErrorWithError(task.error)
                }
                else if task.exception != nil {
                    SVProgressHUD.showError(with: task.exception)
                }
                else if task.isCancelled {
                    SVProgressHUD.showErrorWithCancellation()
                }
                else {
                    SVProgressHUD.dismiss()
                    CUTEDataManager.sharedInstance().saveRentTicket(self.form().ticket)

                    if let identifier = self.form().ticket.identifier {
                        if let url = CUTEPermissionChecker.URLWithPath("/wechat-poster/" + identifier) {
                            let controller = CUTERentTicketPreviewViewController()
                            controller.ticket = self.form().ticket
                            controller.url = url
                            controller.load(URLRequest(url:url))
                            self.navigationController?.pushViewController(controller, animated: true)
                        }
                    }
                }
                
                return task
            })
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
