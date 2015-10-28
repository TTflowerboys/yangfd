//
//  CUTESurroundingCell.swift
//  currant
//
//  Created by Foster Yin on 10/28/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTESurroundingCell: UITableViewCell {

    let nameLabel:UILabel!
    let typeImageView:UIImageView!
    let typeButton:UIButton!
    let durationButton:UIButton!
    let deleteButton:UIButton!

    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        nameLabel = UILabel()
        typeImageView = UIImageView(image: UIImage(named: ""))
        typeButton = UIButton()
        durationButton = UIButton()
        deleteButton = UIButton()

        super.init(style: style, reuseIdentifier: reuseIdentifier)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
