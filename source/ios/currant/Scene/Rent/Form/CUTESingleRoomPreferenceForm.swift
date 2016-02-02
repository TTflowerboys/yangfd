//
//  CUTESingleRoomPreferenceForm.swift
//  currant
//
//  Created by Foster Yin on 12/29/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTESingleRoomPreferenceForm)
class CUTESingleRoomPreferenceForm: CUTETicketForm {

    //TODO: let form work as View Model, just proxy the attribute of ticket
    //preference
    var genderRequirement:String?
    var age:String?
    var occupation:CUTEEnum?
    var allowSmoking:Bool = true
    var allowPet:Bool = true
    var allowBaby:Bool = true

    //exist flatmate
    var currentMaleRoommates:Int?
    var currentFemaleRoommates:Int?
    var accommodates:Int?
    var area:CUTEArea?
    var independentBathroom:Bool = false
    var otherRequirements:String?

    var allOccupation:[CUTEEnum]!

    override func fields() -> [AnyObject]! {
        return [
            [FXFormFieldKey:"accommodates", FXFormFieldTitle:STR("SingleRoomPreference/可入住人数"), FXFormFieldCell: CUTEFormRoommateCountPickerCell.self, "style": UITableViewCellStyle.Value1.rawValue, FXFormFieldAction: "onAccommodatesEdit:", FXFormFieldHeader:STR("SingleRoomPreference/入住者要求")],

            [FXFormFieldKey:"genderRequirement", FXFormFieldTitle:STR("SingleRoomPreference/入住性别要求"), FXFormFieldOptions:[STR("不限"), STR("男"), STR("女")], FXFormFieldDefaultValue: getDefaultGenderRequirement(), FXFormFieldAction:"onGenderRequirementEdit:"],

            [FXFormFieldKey:"age", FXFormFieldTitle:STR("SingleRoomPreference/入住年龄限制"), FXFormFieldCell: CUTEFormAgeRangePickerCell.self, FXFormFieldAction:"onAgeEdit:"],

            [FXFormFieldKey:"occupation", FXFormFieldTitle:STR("SingleRoomPreference/入住职业限制"), FXFormFieldOptions: allOccupation, FXFormFieldDefaultValue: getDefaultOccupation(), FXFormFieldAction:"onOccupationEdit:"],

            [FXFormFieldKey:"allowSmoking", FXFormFieldTitle:STR("SingleRoomPreference/允许吸烟"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self, FXFormFieldAction: "onAllowSmokingEdit:"],

            [FXFormFieldKey:"allowPet", FXFormFieldTitle:STR("SingleRoomPreference/允许携宠物入住"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self, FXFormFieldAction: "onAllowPetEdit:"],

            [FXFormFieldKey:"allowBaby", FXFormFieldTitle:STR("SingleRoomPreference/允许带小孩入住"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self, FXFormFieldAction: "onAllowBabyEdit:"],


            [FXFormFieldKey:"currentMaleRoommates", FXFormFieldTitle:STR("SingleRoomPreference/当前男室友的数量"), FXFormFieldCell: CUTEFormRoommateCountPickerCell.self, "style": UITableViewCellStyle.Value1.rawValue, FXFormFieldAction: "onCurrentMaleRoommatesEdit:", FXFormFieldHeader:STR("SingleRoomPreference/目前室友")],

            [FXFormFieldKey:"currentFemaleRoommates", FXFormFieldTitle:STR("SingleRoomPreference/当前女室友的数量"), FXFormFieldCell: CUTEFormRoommateCountPickerCell.self, "style": UITableViewCellStyle.Value1.rawValue, FXFormFieldAction: "onCurrentFemaleRoommatesEdit:"],


            [FXFormFieldKey:"area", FXFormFieldTitle:STR("SingleRoomPreference/单间面积"), FXFormFieldHeader:STR("SingleRoomPreference/其他"), FXFormFieldAction: "onAreaEdit:"],

            [FXFormFieldKey:"independentBathroom", FXFormFieldTitle:STR("SingleRoomPreference/独立卫浴"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self, FXFormFieldAction: "onIndependentBathroomEdit:"],
            
            [FXFormFieldKey:"otherRequirements", FXFormFieldTitle:STR("SingleRoomPreference/对租客的其他要求"), FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldCell:CUTEFromOtherRequirementsTextViewCell.self, FXFormFieldPlaceholder:STR("SingleRoomPreference/请填写您对租客的其他要求，比如租房需要提供学生证，名片，银行流水等"), FXFormFieldAction: "onOtherRequirements:"],

            [FXFormFieldKey: "submit", FXFormFieldCell: CUTEFormButtonCell.self, FXFormFieldTitle: STR("SingleRoomPreference/预览"), FXFormFieldHeader: "", FXFormFieldAction: "onSubmit:"]
        ]
    }

    //MARK: - Private

    func getDefaultOccupation() -> CUTEEnum {
        if occupation != nil {
            return occupation!
        }
        else {
            return allOccupation.filter({ (occu:CUTEEnum) -> Bool in
                return occu.slug == "unlimited";
            }).first!
        }
    }

    func getDefaultGenderRequirement() -> String {
        if genderRequirement != nil {
            return genderRequirement!
        }
        else {
            return STR("不限")
        }
    }

}
