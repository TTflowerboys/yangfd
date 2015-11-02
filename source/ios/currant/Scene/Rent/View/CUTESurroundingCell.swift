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
    let removeButton:UIButton!

    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        typeImageView = UIImageView(image: UIImage(named: "icon-university"))
        nameLabel = UILabel()

        typeButton = UIButton()
        typeButton.setImage(UIImage(named: "icon-down-arrow"), forState: UIControlState.Normal)
        typeButton.setTitle("步行", forState: UIControlState.Normal)
        typeButton.setTitleColor(UIColor(hex6: 0x999999), forState: UIControlState.Normal)

        durationButton = UIButton()
        durationButton.setImage(UIImage(named: "icon-down-arrow"), forState: UIControlState.Normal)
        durationButton.setTitle("15分钟", forState: UIControlState.Normal)
        durationButton.setTitleColor(UIColor(hex6: 0x999999), forState: UIControlState.Normal)
        removeButton = UIButton()
        removeButton.setImage(UIImage(named: "button-remove"), forState: UIControlState.Normal)
        super.init(style: style, reuseIdentifier: reuseIdentifier)

        self.contentView.addSubview(typeImageView)
        self.contentView.addSubview(nameLabel)
        self.contentView.addSubview(typeButton)
        self.contentView.addSubview(durationButton)
        self.contentView.addSubview(removeButton)

        self.backgroundColor = UIColor.clearColor()
        let backgroundView = UIView()
        backgroundView.backgroundColor = UIColor.clearColor()
        self.backgroundView = backgroundView
        self.contentView.backgroundColor = UIColor(hex6:0xffffff)
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

    override func layoutSubviews() {
        super.layoutSubviews()
        self.contentView.frame = CGRectMake(0, 13, self.frame.size.width, self.frame.size.height - 13)
        self.typeImageView.frame = CGRectMake(10, 8, 15, 15)
        self.nameLabel.frame = CGRectMake(25, 8, self.frame.size.width - (25 + 25), 15)
        self.removeButton.frame = CGRectMake(self.frame.size.width - 25, 8, 15, 14)
        self.typeButton.frame = CGRectMake(10, self.frame.size.height - 28, 57, 18)
        self.typeButton.titleEdgeInsets = UIEdgeInsetsMake(0, 0, 0, 22)
        self.typeButton.imageEdgeInsets = UIEdgeInsetsMake(0, 34, 0, 11)
        self.durationButton.frame = CGRectMake(67, self.frame.size.height - 28, 57, 18)
        self.durationButton.titleEdgeInsets = UIEdgeInsetsMake(0, 0, 0, 22)
        self.durationButton.imageEdgeInsets = UIEdgeInsetsMake(0, 34, 0, 11)
    }

}
