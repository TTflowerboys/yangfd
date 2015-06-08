//
//  CUTERentAddressMapViewController.h
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "FXForms.h"
#import "CUTETicket.h"

@interface CUTERentAddressMapViewController : UIViewController <FXFormFieldViewController>

@property (nonatomic, strong) FXFormField *field;

@property (strong, nonatomic) CUTETicket *ticket;

@property (nonatomic) BOOL singleUseForReedit;

@property (nonatomic, copy) dispatch_block_t updateAddressCompletion;

@end
