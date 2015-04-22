//
//  CUTEFormImagePickerCell.h
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXForms.h"
#import "CUTETicket.h"

@interface CUTEFormImagePickerCell : FXFormImagePickerCell

@property (strong, nonatomic) CUTETicket *ticket;

- (NSArray *)images;

- (void)setImages:(NSArray *)images;

@end
