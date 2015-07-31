//
//  CUTERentAddressEditViewController.h
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXForms.h"
#import "CUTEEnum.h"
#import "CUTETicket.h"
#import "CUTEFormViewController.h"

@interface CUTERentAddressEditViewController : CUTEFormViewController

@property (strong, nonatomic) NSString *lastPostcode;

@property (nonatomic, copy) dispatch_block_t updateAddressCompletion;



@end
