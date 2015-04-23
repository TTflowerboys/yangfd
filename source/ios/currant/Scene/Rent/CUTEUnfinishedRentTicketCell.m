//
//  CUTEUnfinishedRentTicketCell.m
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketCell.h"
#import "BBTScrollImageView.h"
#import "CUTEUnfinishedRentTicketPlaceholderImageView.h"

@interface CUTEUnfinishedRentTicketCell () {

    BBTScrollImageView *_scrollImageView;

    CUTEUnfinishedRentTicketPlaceholderImageView *_placeholderView;

    UIView *_textContainerView;

    UILabel *_nameLabel;

    UILabel *_typeLabel;

    UIButton *_editButton;
}

@end

@implementation CUTEUnfinishedRentTicketCell

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self)
    {
        
    }
    return self;
}


- (void)updateWithTicket:(CUTETicket *)ticket {
    
}

@end
