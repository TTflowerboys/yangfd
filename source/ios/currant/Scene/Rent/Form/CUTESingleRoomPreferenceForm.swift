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
    var gender:CUTEEnum?
    var age:CUTEEnum?
    var occupation:CUTEEnum?
    var allowSmoking:Bool = false
    var allowPet:Bool = false
    var allowChild:Bool = false

    //exist flatmate
    var maleFlatmateCount:Int?
    var femaleFlatmateCount:Int?
    var allowCount:Int?
    var area:CUTEArea?
    var ensuite:Bool = false
    var requirement:String?

    override func fields() -> [AnyObject]! {
        return [[FXFormFieldKey:"gender", FXFormFieldTitle:STR("SingleRoomPreference/入住性别要求"), FXFormFieldHeader:STR("SingleRoomPreference/入住者要求")],
            [FXFormFieldKey:"age", FXFormFieldTitle:STR("SingleRoomPreference/入住年龄限制")],
            [FXFormFieldKey:"occupation", FXFormFieldTitle:STR("SingleRoomPreference/入住置业限制")],
            [FXFormFieldKey:"allowSmoking", FXFormFieldTitle:STR("SingleRoomPreference/允许吸烟"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self],
            [FXFormFieldKey:"allowPet", FXFormFieldTitle:STR("SingleRoomPreference/允许携宠物入住"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self],
            [FXFormFieldKey:"allowChild", FXFormFieldTitle:STR("SingleRoomPreference/允许带小孩入住"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self],
            [FXFormFieldKey:"maleFlatmateCount", FXFormFieldTitle:STR("SingleRoomPreference/当前男室友的数量"), FXFormFieldHeader:STR("SingleRoomPreference/目前室友")],
            [FXFormFieldKey:"femaleFlatmateCount", FXFormFieldTitle:STR("SingleRoomPreference/当前女室友的数量")],
            [FXFormFieldKey:"allowCount", FXFormFieldTitle:STR("SingleRoomPreference/可入住新室友")],
            [FXFormFieldKey:"area", FXFormFieldTitle:STR("SingleRoomPreference/单间面积"), FXFormFieldHeader:STR("SingleRoomPreference/其他")],
            [FXFormFieldKey:"ensuite", FXFormFieldTitle:STR("SingleRoomPreference/独立卫浴"), FXFormFieldType: FXFormFieldTypeOption, FXFormFieldCell: CUTEFormSwitchCell.self,],
            [FXFormFieldKey:"requirement", FXFormFieldTitle:STR("SingleRoomPreference/对租客的其他要求"), FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldCell:CUTEFormTextViewCell.self, FXFormFieldPlaceholder:STR("SingleRoomPreference/请填写您对租客的其他要求，比如租房需要提供学生证，名片，银行流水等")]]
    }
}
