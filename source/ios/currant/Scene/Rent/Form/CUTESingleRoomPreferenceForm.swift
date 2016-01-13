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

    //preference
    var genderRequirement:String?
    var age:String?
    var occupation:CUTEEnum?
    var noSmoking:Bool = true
    var noPet:Bool = true
    var noBaby:Bool = true

    //exist flatmate
    var currentMaleRoommates:Int?
    var currentFemaleRoommates:Int?
    var availableRooms:Int?
    var area:CUTEArea?
    var indenpendentBathroom:Bool = true
    var otherRequirements:String?

    override func fields() -> [AnyObject]! {
        return [[FXFormFieldKey:"genderRequirement", FXFormFieldTitle:STR("SingleRoomPreference/入住性别要求"), FXFormFieldHeader:STR("SingleRoomPreference/入住者要求"), FXFormFieldOptions:[STR("男"), STR("女")], FXFormFieldAction:"onGenderRequirementEdit:"],
            [FXFormFieldKey:"age", FXFormFieldTitle:STR("SingleRoomPreference/入住年龄限制"), FXFormFieldCell: CUTEFormRangePickerCell.self],
            [FXFormFieldKey:"occupation", FXFormFieldTitle:STR("SingleRoomPreference/入住置业限制")],
            [FXFormFieldKey:"noSmoking", FXFormFieldTitle:STR("SingleRoomPreference/允许吸烟"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self],
            [FXFormFieldKey:"noPet", FXFormFieldTitle:STR("SingleRoomPreference/允许携宠物入住"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self],
            [FXFormFieldKey:"noBaby", FXFormFieldTitle:STR("SingleRoomPreference/允许带小孩入住"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self],
            [FXFormFieldKey:"currentMaleRoommates", FXFormFieldTitle:STR("SingleRoomPreference/当前男室友的数量"), FXFormFieldHeader:STR("SingleRoomPreference/目前室友"), FXFormFieldCell: CUTEFormCountPickerCell.self, "style": UITableViewCellStyle.Value1.rawValue],
            [FXFormFieldKey:"currentFemaleRoommates", FXFormFieldTitle:STR("SingleRoomPreference/当前女室友的数量"), FXFormFieldCell: CUTEFormCountPickerCell.self, "style": UITableViewCellStyle.Value1.rawValue],
            [FXFormFieldKey:"availableRooms", FXFormFieldTitle:STR("SingleRoomPreference/可入住新室友"), FXFormFieldCell: CUTEFormCountPickerCell.self, "style": UITableViewCellStyle.Value1.rawValue],
            [FXFormFieldKey:"area", FXFormFieldTitle:STR("SingleRoomPreference/单间面积"), FXFormFieldHeader:STR("SingleRoomPreference/其他")],
            [FXFormFieldKey:"indenpendentBathroom", FXFormFieldTitle:STR("SingleRoomPreference/独立卫浴"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self,],
            [FXFormFieldKey:"otherRequirements", FXFormFieldTitle:STR("SingleRoomPreference/对租客的其他要求"), FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldCell:CUTEFormTextViewCell.self, FXFormFieldPlaceholder:STR("SingleRoomPreference/请填写您对租客的其他要求，比如租房需要提供学生证，名片，银行流水等")]]
    }
}
