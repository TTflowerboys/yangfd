//
//  CUTEWholePropertyPreferenceForm.swift
//  currant
//
//  Created by Foster Yin on 12/29/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEWholePropertyPreferenceForm)
class CUTEWholePropertyPreferenceForm: CUTETicketForm {

    var requirement:String?

    override func fields() -> [AnyObject]! {
            return [[FXFormFieldKey:"requirement", FXFormFieldTitle:STR("SingleRoomPreference/对租客的其他要求"), FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldCell:CUTEFormTextViewCell.self, FXFormFieldPlaceholder:STR("SingleRoomPreference/请填写您对租客的其他要求，比如租房需要提供学生证，名片，银行流水等")]]
    }

}
