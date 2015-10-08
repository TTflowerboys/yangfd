//
//  CUTEFormAreaTextFieldCell.swift
//  currant
//
//  Created by Foster Yin on 10/8/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTEFormAreaTextFieldCell: CUTEFormTextFieldCell {

    /*
    // Only override drawRect: if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func drawRect(rect: CGRect) {
        // Drawing code
    }
    */

    override func textField(textField: UITextField, shouldChangeCharactersInRange range: NSRange, replacementString string: String) -> Bool {
        let currentText = textField.text ?? ""
        let newString = (currentText as NSString).stringByReplacingCharactersInRange(range, withString: string)
        let maxCount = 10

        if currentText.characters.count >= maxCount {
            if newString.characters.count < currentText.characters.count {
                return true
            }
            else {
                return false
            }
        }
        else {
            if newString.characters.count > maxCount {
                return false
            }
            else {
                return true
            }
        }
    }
}
