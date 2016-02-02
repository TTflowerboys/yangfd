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

    var otherRequirements:String?

    override func fields() -> [AnyObject]! {
            return [[FXFormFieldKey:"otherRequirements", FXFormFieldTitle:STR("SingleRoomPreference/对租客的其他要求"), FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldCell:CUTEFromOtherRequirementsTextViewCell.self, FXFormFieldPlaceholder:STR("SingleRoomPreference/请填写您对租客的其他要求，比如租房需要提供学生证，名片，银行流水等"), FXFormFieldAction: "onOtherRequirements:"],
                [FXFormFieldKey: "submit", FXFormFieldCell: CUTEFormButtonCell.self, FXFormFieldTitle: STR("SingleRoomPreference/预览"), FXFormFieldHeader: "", FXFormFieldAction: "onSubmit:"]
        ]
    }

}
